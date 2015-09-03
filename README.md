Apoc
====

Apoc is a node module and a command-line tool for making dynamic Cypher queries. Using its **Apoc Cypher Format** (ACF), it adds the following features on top of Cypher.

* Comments using `#` or `//`
* JavaScript code within backticks
* Variables between %% (when used as a node module)
* Multiple query statements in a file
* Ability to include other ACF files
* Local variables in ACF files
* Global variables

Apoc is not a mapper (ORM, ODM, ONM, OxM) of any kind, nor does it provide any "friendly" or "improved" transaction methods on top of the Neo4j REST API. It is just a tool for enhancing your experience with Cypher. You will still need to write your Cypher queries, but Apoc will make them more powerful and much easier to use.

## Installation

As a node module:

```
$ npm install apoc --save
```

When installed as a node module, you can either directly pass Cypher / ACF queries to Apoc or load an ACF file with Cypher / ACF queries for Apoc to execute.

As a commandline tool:

```
$ npm install apoc -g
```

When installed as a commandline tool, you will be able to execute ACF files from the command-line, using the `apoc` command.

## Configuration

Apoc will look for your Neo4j configuration details in two places:

1. `.apoc.yml` file in your home directory
2. Shell's environment variables.

**Sample .apoc.yml**:

```
protocol: http
host: 192.168.0.8
port: 2902
username: neo4j
password: neo4j
```

**Environment variables**

```
NEO4J_PROTOCOL=http
NEO4J_HOST=192.168.0.5
NEO4J_PORT=7474
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=j4neo
```

The value defined in the environment variables will take precedence over the values set in the `.apoc.yml` file. `host` and `port` will default to 127.0.0.1 and 7474, respectively.

## Apoc Cypher File

An Apoc Cypher file is a plain-text file with a .acf extension, which contains Cypher / ACF queries.

Example of an ACF file:

```
# Create the world
CREATE (n:ApocTest { name: 'World' }) RETURN n

# Details about Asia
include includes/asia.acf

# Details about Spain
include includes/extra/spain.acf
```

The contents of `includes/asia.acf`:

```
CREATE (n:ApocTest { name: 'Asia' }) RETURN n

include misc.acf
include extra/india.acf
```

The contents of `includes/extra/spain.acf`:

```
CREATE (n:ApocTest { name: 'Spain' }) RETURN n
```

With respect to this ACF file, Apoc will look for a sibling directory named `includes` and a child directory named `extra` within `includes`, and include the files specified in the ACF file.

### Variable placeholders

```
MATCH (n:%type%) RETURN n
```

Variable placeholders are marked with a variable name between %%. The variable placeholder is replaced with the corresponding variable value, when it is passed in a **variables** object as the second parameter of an apoc query.

```
var apoc = require('apoc')
var query = apoc.query('MATCH (n:%type%) RETURN n', { type: 'Dog' })
```

resulting query:

```
MATCH (n:Dog) RETURN n
```

If the variable for a palceholder is not found, the placeholder will be left intact.

### JavaScript Code

```
CREATE (n:Animal { time: `Date.now()` }) RETURN n
```

Apoc will interpret any string within backticks as JavaScript code, and try to execute it. However, the API is limited only to the core JavaScript API provided by V8, hence it has no access to node's APIs or the objects created by you. 

In case you want to make any external object available to the JavaScript code, you can pass in a **context** object as the third parameter to the apoc query.

```js
var apoc = require('apoc')
var acf = 'CREATE (n:Info { node: "`versions.node`", sum: `add(40, 1)` }) RETURN n'
var query = apoc.query(acf, {}, {
  versions: process.versions, // node API
  add: function(a, b) { // custom function
    return a + b
  }
})
```

resulting query:

```
CREATE (n:Status { node: '0.10.36', sum: 41 }) RETURN n
```

The variables and the context objects maintain their order in an apoc query. Therefore, the variables object (even if empty) should always preceed the context object, if you want to specify a context object.

### ACF variables

**Local variables**

You can define local variables in an ACF file using the `var` keyword. The variables are local to the file and its included files. The value of the variable can also be a JavaScript expression.

```
var label = ApocTest
var floor=`Math.floor(22/7)`

CREATE(a:%label% { pi: `22/7`, floor: %floor% }) RETURN a

CREATE(b:%label% { label: "%label%", floor: %floor% }) RETURN b
```

Variables with the same name declared in an included file takes precedence over the one declared in its parent file.

ACF variables take precedence over those specified by the `variables` query parameter.

**Global variables**

You can define global variables using the `global` keyword. Like local variables, the values of global variables can be JavaScript expressions too.

```
global title = Universal Brotherhood
```

This global variable could be defined in last of the 100th included file, but would still be available to the root file and other files.

Global variables redefined at the lower order of inclusion will overwrite the existing value.

Minimize the use of global variables, they can introduce hard to debug behaviors.

### Multiple query statements

A single line break can be used to aesthetically break long query statements. Each line is understood as a part of the same query statement.

```
CREATE (a:ApocTest { word: 'Naina' })
CREATE (b:ApocTest { word: 'Eye' })
CREATE (a)-[r:MEANS]->(b) RETURN a, b
```

A semicolon at the end of the statement is used to separate query statements.

```
CREATE (n:ApocTest { lang: 'hi', word: 'Naina' }) RETURN n;
CREATE (n:ApocTest { lang: 'es', word: 'Ojo' }) RETURN n;
CREATE (n:ApocTest { lang: 'it', word: 'Occhio' }) RETURN n;
```

A empty linebreak can also be used in place of a semicolon to seprate query statements. All of the following are interpreted and executed as independent, separate queries.

```
CREATE (n:ApocTest { lang: 'hi', word: 'Naina' }) RETURN n

CREATE (n:ApocTest { lang: 'es', word: 'Ojo' }) RETURN n

CREATE (n:ApocTest { lang: 'it', word: 'Occhio' }) RETURN n
```

Want to see some sample ACF files? Look under the `test/fixtures` directory of this project.

## Usage

### As a node module

Here is a quick preview of how the Apoc API looks like. Details will be explained in the next section.

Simple example of using an inline query:

```js
var apoc = require('apoc')
var query = apoc.query('MATCH (n) RETURN n')
console.log(query.statements) // array of statements in this query
query.exec().then(function (result) {
  console.log(result)
}, function (fail) {
  console.log(fail)
})
```

Simple example of using an ACF file query:

```js
var apoc = require('apoc')
var query = apoc.query('./test/fixtures/multiline.acf')
console.log(query.statements) // array of statements in this query
query.exec().then(function (result) {
  console.log(result)
}, function (fail) {
  console.log(fail)
})
```

The `apoc` module exposes a single method called `query` with the following signature:

**query(inline query | acf file [,variables] [,context])**

|Parameter|Description
|----|----------
|**inline query**| Inline Cypher / ACF query. ACF queries should be accompanied by their `variable` and / or `context` objects.
|**acf file**| Path to an ACF file. ACF queries in the file should be accompanied by their `variable` and / or `context` objects.
|**variables**| An object of variables to be used with ACF queries. A variable placeholder is marked with enclosing %%.
|**context**| An object of variables and functions, which are made available to the JavaScript code in ACF queries.

The `query()` method returns an object with these two objects:

|Object|Description
|----|----------
|**statements**| Array of Cypher statements generated for this query.
|**exec**| A method for executing the generated Cypher query. The generated query is not executed, till this method is called. It accepts an optional options object, which can be used to overwrite the `protocol`, `host`, `port`, `username`, and the `password` values. It returns a promise.

Here is a more elaborate example of using the apoc module:

```js
var apoc = require('apoc')
apoc.query('CREATE(n:ApocTest { node: "`versions.node`", sum: `add(40, 1)` }) RETURN n', {}, {
  versions: process.versions,
  add: function(a, b) {
    return a + b
  }
})
.exec(config).then(function (result) {
  console.log(result)
}, function (fail) {
  done(fail)
})
```

If the ACF query above was in a file named `query.acf`, it would be re-written this way:

```js
var apoc = require('apoc')
apoc.query(__dirname + '/query.acf', {}, {
  versions: process.versions,
  add: function(a, b) {
    return a + b
  }
})
.exec(config).then(function (result) {
  console.log(result)
}, function (fail) {
  done(fail)
})
```

### From the command-line

```
$ apoc populate.acf
```

Using the `apoc` command, execute ACF files like they were shell scripts or batch files. The ability to include ACF files and execute multiple queries together make this a very useful tool.

Commandline options:

```
$ apoc --help

  Usage: apoc [options]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -v, --verbose  Verbose response messages
    -q, --query    Print query statements
```

## License (MIT)

Copyright (c) 2015 Hage Yaapa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
