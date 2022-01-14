# bubbles - a simplified management UI for Ceph
# Copyright (C) 2021 SUSE, LLC
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
#
# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false

import importlib
import pathlib
import pkgutil
import bubbles.extras
import logging
from typing import Iterable, Callable, Any, List, Optional, Protocol, cast, Type
from types import ModuleType
from bubbles.module import BubblesExtra


class BubblesExtraProto(Protocol):
    __path__: str
    __bubbles_extra_class__: Type[BubblesExtra]


class ExtraModule():
    def __init__(self, name: str, module: BubblesExtraProto, obj: BubblesExtra) -> None:
        self.name = name
        self.module = module
        self.obj = obj

    def __str__(self) -> str:
        return "ExtraModule(" + ",".join(
            f"{name}={repr(value)}"
            for name, value in self.__dict__.items())

    def __repr__(self) -> str:
        return self.__str__()


def discover_extras() -> Iterable[ExtraModule]:
    extras_path = pathlib.Path(__file__).parent / "extras"
    modules = pkgutil.iter_modules(
        [str(extras_path.resolve())], bubbles.extras.__name__ + "."
    )
    result = []
    for _, name, _ in modules:
        module = cast(BubblesExtraProto, importlib.import_module(name))
        result.append(
            ExtraModule(name, module, module.__bubbles_extra_class__())
        )
    return result


def enable_extras_autoreload(
    extras: Iterable[ExtraModule], extra_start_args_fn: Callable[[], List[Any]], logger: logging.Logger
) -> None:
    import watchdog.observers.polling
    import watchdog.events

    # Use polling, because the bubbles VM shared folders don't support
    # inotify reliably.
    observer = watchdog.observers.polling.PollingObserver()

    def find_extra_by_filename(fn: str) -> ExtraModule:
        return next(extra for extra in extras if extra.module.__path__[0] in fn)

    def reload_module(event: watchdog.events.FileSystemEvent) -> None:
        if not event.is_directory:
            extra = find_extra_by_filename(event.src_path)
            try:
                logger.info("Reloading %r", extra)
                extra.obj.shutdown()
                extra.module = cast(BubblesExtraProto,
                                    importlib.reload(cast(ModuleType, extra.module)))
                extra.obj = extra.module.__bubbles_extra_class__()
                extra.obj.start(*extra_start_args_fn())
            except Exception as e:
                logger.error(
                    "Error reloading %s: %s", extra, e, exc_info=e
                )

    handler = watchdog.events.FileSystemEventHandler()
    handler.on_any_event = reload_module
    for extra in extras:
        watch = observer.schedule(
            handler, extra.module.__path__[0], recursive=True
        )
        logger.info("Added extra autoreload watch: %r %r", extra, watch)
    observer.start()
