const typescript = require('rollup-plugin-typescript2');
const terser = require('rollup-plugin-terser').terser;
const license = require('rollup-plugin-license');
const camelCase = require("lodash.camelCase");
const pkg = require("./package.json");
const banner=`@license <%= pkg.name %> v<%= pkg.version %>
(c) <%= moment().format('YYYY') %> Finsi, Inc. Credits to @davedupplaw for jq-thermometer
`,
    name = "jquery.thermoquiz",
    fileName=name,
    packageName =camelCase(pkg.name),
    src = "./src/index.ts",
    srcUI ="./src/jquery-ui-deps.ts",
    globals= {
        jquery: '$'
    },
    external=(id)=>id.indexOf("node_modules")!=-1;


module.exports = [
    {
        input: src,
        output: {
            file: `dist/${fileName}.js`,
            name:packageName,
            format: 'umd',
            globals:globals
        },
        plugins: [
            typescript({
                tsconfigOverride: {
                    "compilerOptions": {
                        "target": "es5"
                    }
                }
            }),
            license({
                banner:banner
            })
        ],
        external:external
    },
    //min
    {
        input: src,
        output: {
            file: `dist/${fileName}.min.js`,
            name:packageName,
            format: 'umd',
            globals:globals
        },
        plugins: [
            typescript({
                tsconfigOverride: {
                    "compilerOptions": {
                        "target": "es5"
                    }
                }
            }),
            terser(),
            license({
                banner:banner
            })
        ],
        external:external
    },
    //esm2015
    {
        input: src,
        output: {
            file: `esm2015/${fileName}.js`,
            name:packageName,
            format: 'es'
        },
        plugins: [
            typescript({
            }),
            license({
                banner:banner
            })
        ],
        external:external
    },
    //esm2015 min
    {
        input: src,
        output: {
            file: `esm2015/${fileName}.min.js`,
            name:packageName,
            format: 'es'
        },
        plugins: [
            typescript({
            }),
            terser(),
            license({
                banner:banner
            })
        ],
        external:external
    }
];