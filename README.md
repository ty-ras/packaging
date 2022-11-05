# Typesafe REST API Specification - Library Aggregator Packages

[![CI Pipeline](https://github.com/ty-ras/packaging/actions/workflows/ci.yml/badge.svg)](https://github.com/ty-ras/packaging/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/ty-ras/packaging/actions/workflows/cd.yml/badge.svg)](https://github.com/ty-ras/packaging/actions/workflows/cd.yml)

The Typesafe REST API Specification is a family of libraries used to enable seamless development of Backend and/or Frontend which communicate via HTTP protocol.
The protocol specification is checked both at compile-time and run-time to verify that communication indeed adhers to the protocol.
This all is done in such way that it does not make development tedious or boring, but instead robust and fun!

This particular repository contains libraries, which act as aggregators for a set of other libraries.
The purpose is to make life of users easier, which will only need to write one
```ts
import * as tyras from "@ty-ras/backend-node-io-ts-openapi";
```
instead of many
```ts
import * as tyrasData from "@ty-ras/data";
import * as tyrasDataBE from "@ty-ras/data-backend";
...etc
```

This repository contains the following aggregator libraries:
