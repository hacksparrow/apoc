Apoc
====

Apoc is a node module and a command-line tool to make Cypher queries easier.

## Installation

As a node module:

```
$ npm install apoc --save
```

As a command-line tool:

```
$ npm install apoc -g
```

## Apoc Cypher File

An Apoc Cypher file is a text file with **.acf** extension, which contains cypher queries in it. It supports comments using `//`, and can include other acf files from the main file. Here is an example.

The contents of the main acf file:

```
// in-file query
create (m: ApocTestMember {
    name: 'El Capitan'
})

// groups
include groups.acf

// roles
include roles.acf
```

The contents of groups.acf:

```
create (g:ApocTestGroup {
    name: 'Hackers'
})
```

The contents of roles.acf:

```
create (r: ApocTestRole {
    name: 'Designer'
})
```

The consolidated content is generated as a single query, which makes the identifiers defined in individual files global.

Future versions of apoc will enable including acf files from non-main files and writing Cypher queries even easier.

## Usage

**As a node module**

apoc accepts an acf file path or a cypher query, and returns an object with the following properties:

|Name|Description
|----|----------
|`text`|Text of the consolidated query.
|`exec([port, host])`|Method to execute the query at the server. The `port` and `host` parameters default to 7474 and localhost, respectively. It returns a promise.

Usage example:

```
var apoc = require('apoc')

// generate the consolidated cypher query from the acf file
var query = apoc('index.acf')

// the consolidated query
console.log(query.text)

// execute the query at localhost:7474
query.exec().then(function (response) {
    console.log(response)
}, function (fail) {
    console.log(fail)
})

// specify a cypher query and send it to the server
apoc('match (n) return n').exec().then(function (response) {
    console.log(response)
}, function (fail) {
    console.log(fail)
})

```

**From the commandline**

```
$ apoc index.acf
```

Execute acf files with apoc like they were shell scripts. Excellent for writing your queries in the acf files and executing them from the commandline, while taking advantage of acf features.

## License

Copyright (c) 2014 Hage Yaapa &lt;captain@hacksparrow.com&gt;

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
