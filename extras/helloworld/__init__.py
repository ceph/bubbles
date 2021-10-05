#!/usr/bin/env python3

from fastapi import APIRouter

router = APIRouter(prefix="/hello")


@router.get("/world", name="Hello World!")
async def hello_world():
    return "Hello World!"


def init(app, api):
    app.include_router(router)
