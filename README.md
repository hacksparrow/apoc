Apoc
====

Apoc is a node module and a command-line tool to make Cypher queries easier.

## Apoc Cypher File

An Apoc Cypher file is a text file with **.acf** extension, which contains cypher queries in it. It supports comments using `//`, and can include other acf files from the main file:

```
// groups
include groups.acf

// roles
include roles.acf
```

The consolidated content is generated as a single query, which makes the identifiers defined in individual files global.

Future versions of apoc will enable including acf files from non-main files and writing Cypher queries even easier.

## Usage

apoc can be used as a node module:

```
var apoc = require('apoc')
var query = apoc('index.acf')
```

apoc can be used from the commandline:

```
$ apoc index.acf
```

## License

Copyright (c) 2014 Hage Yaapa &lt;captain@hacksparrow.com&gt;

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
