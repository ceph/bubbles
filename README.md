# Bubbles

Bubbles is an experimental approach to simplifying Ceph management and
operation.


## Yet Another Dashboard?

Being under heavy development, and with a large amount of uncertainty on where
this road might lead us in the end, we chose to keep this effort separate from
the main Ceph tree, and thus the existing Ceph Dashboard. We believe this will
speed up development while reducing the maintenance burden on the Ceph
Dashboard.

At the moment, we are also relying on technologies not used by the Ceph
Dashboard, nor included in the vanilla Ceph distribution. We don't mean with
this that we intend to be kept as a separate module in the future. It simply
means we prefer to develop using these technologies, and we believe these are
the better technology for our development effort.

We are committed to eventually merge this effort into the existing Ceph
Dashboard should there be interest from the community. We believe it will take
about a year of development until we stabilize the project, having it in a
reasonable shape to merge with the Ceph Dashboard. When the time comes, we
intend to merge it using whatever technologies the Ceph Dashboard uses, or plans
to use. This might mean more effort down the line, but it's an effort we're
willing to make.


## Scope

Our premise is that we aim at simplifying Ceph management and operation. There
are a lot of things still up in the air, but at the moment we know a few things:

1. It must be orchestrator-driven
2. The user won't be exposed to Ceph-specific concepts such as pools, PGs, or
   Ceph services.
3. The UX/UI must be intuitive, driven by what's wrong with the system.
4. Must make operations as trivial as possible, including recovery from disaster
   scenarios.

Given we are orchestrator-centric, with a particular focus on `cephadm` at the
moment, there are no plans to support an rpm-based install. This might change as
things progress, depending on need and/or demand.

## Developing

For more information on the development environment, please read
[the deployment guide](deploy/README.md).


## Contributing

TBD


## Why "Bubbles"?

Because it's cute. And fits within the broader theme of Ceph (because there are
bubbles in the sea), and the theme of the Aquarium Project, from which this
effort stems.


## License

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You can find the full license [here](LICENSE).
