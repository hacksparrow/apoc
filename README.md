Apoc
====

Apoc is a node module and a command-line tool to make Cypher queries dynamic and powerful. It adds the following features on top of Cypher.

* Comments using `//`
* JavaScript code within backticks
* Variables within %% (when used as a node module)
* Include other acf files from the main file

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

An Apoc Cypher file is a text file with **.acf** extension, which contains Cypher queries in it with extended acf features. Here is an example.

The contents of the main acf file:

```
create (m: ApocTestMember {
    id: 'u`Date.now()`', // JavaScript code
    name: 'El Capitan',
    twitter: '%twitter%', // template code
    email: '%email%'
})

// groups
include groups.acf

// roles
include roles.acf
```

The contents of groups.acf:

```
create (g:ApocTestGroup {
    name: 'Hackers',
    id: '`Math.floor(Math.random()*1000)`'
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

apoc accepts an acf file path or a cypher query and an optional object to with the variable for the template system.



It returns an object with the following properties:

|Name|Description
|----|----------
|text|Text of the consolidated query.
|exec([port, host])|Method to execute the query at the server. The `port` and `host` parameters default to 7474 and localhost, respectively. It returns a promise.

Usage example:

```
var apoc = require('apoc')

// generate the consolidated cypher query from the acf file
var query = apoc('index.acf', { twitter: '@hacksparrow', email: 'captain@hacksparrow.com' })

// the consolidated query
console.log(query.text)

// execute the query at localhost:7474
query.exec().then(function (response) {
    console.log(response)
}, function (fail) {
    console.log(fail)
})

// specify a cypher query and execute it on the server
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

## API

Apoc provides useful and commonly used algorithms and functions.

**md5**

```
create (r1: ApocTestRole {
    name: 'Designer',
    id: '`md5('apple')`'
})

```

**[bcrypt](https://www.npmjs.org/package/bcrypt)**

```
create (g: ApocTestUser {
    name: 'Apoc',
    secret: '`bcrypt.hashSync('sekr37', bcrypt.genSaltSync(10))`'
})
```

Many more will be added.

## License

Copyright (c) 2014 Hage Yaapa &lt;captain@hacksparrow.com&gt;

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
