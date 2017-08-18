var build = require('cmpx-build');

var path = require('path'),
    fs = require('fs');

//cmpx-loader
var cmpx = require('cmpx'),
    CompileRender = cmpx.CompileRender;

var _vmRegex = /(\s*@VMView\s*\((?:\n|\r|\s)*\{)((?:\n|\r|.)*?)(\}(?:\n|\r|\s)*\)(?:\n|\r|\s)*(?:\w+\s+)*class(?:\n|\r|\s)+(?:\w+\s+)+extends(?:\n|\r|\s)+(?:\w+\s*)+)/gmi,
    _vmContentRegex = /(^(?:\n|\r|\s)*|\,(?:\n|\r|\s)*)(tmplUrl|tmpl|styleUrl)\s*\:\s*([`"'])((?:\n|\r|.)*)\3((?:\n|\r|\s)*$|(?:\n|\r|\s)*\,)/mgi,
    _vmStrGGRegex = /\\(.)/mg;
  
var _webPackCtrlRegex = /new +WebpackLoaderContorllerResult\s*\(\s*(['"`])([^'"`]*)\1[^,]*\,[^'"`]*(['"`])([^'"`]*)\3\)/gmi;

var _buildRegex = /##%(tmpl|tmplUrl|styleUrl|\$render)%\$\-\[([^\]]*?)\]/gmi;

var _buildTmpl = function (tmpl) {

    return build.buildTmpl(tmpl);

}, _escapeTmpl = function (name, content) {

    return ['##%', name, "%$-[", encodeURIComponent(content), ']'].join('');

}, _escapeVM = function (resourcePath, source, encoding) {
    let files = [];
    encoding || (encoding = 'utf-8');
    if (_webPackCtrlRegex.test(source)){
        source = source.replace(_webPackCtrlRegex, function (find, split, path, split1, name) {
            return `new AsyncResult(function (cb) {
                require.ensure([], function () {
                    let controller = require('${path}')['${name}'];
                    cb(new ContorllerResult(controller));
                });
            })`;
        });
    }
    if (_vmRegex.test(source)) {
        source = source.replace(_vmRegex, function (find, begin, vmContent, end) {
          vmContent = vmContent.replace(_vmContentRegex, function (find, begin, name, split, content, end) {
            let buildContent = '', filePath, fileContent;
            switch (name) {
              case 'tmpl':
                content = content.replace(_vmStrGGRegex, '$1');
                buildContent = _buildTmpl(content);
                break;
              case 'tmplUrl':
                filePath = content;
                filePath = path.join(path.dirname(resourcePath), filePath);
                files.push(filePath);
                fileContent = fs.readFileSync(filePath, encoding);
                buildContent = _buildTmpl(fileContent);
                break;
              case 'styleUrl':
                filePath = content;
                filePath = path.join(path.dirname(resourcePath), filePath);
                files.push(filePath);
                fileContent = fs.readFileSync(filePath, encoding);
                buildContent = 'function() { return `' + fileContent + '`; }';
                break;
            }
            return [begin, name, ': ', buildContent, end].join('');
          });
          return [begin, vmContent, end].join('');
        });
      }

    return { vmSource: source, vmFiles: files };

}, _buildTypeScript = function (resourcePath, source, encoding) {
    let { content, files } = build.buildTypeScript(resourcePath, source, encoding);

    let { vmSource, vmFiles } = _escapeVM(resourcePath, content, encoding);
    vmFiles = files.concat(vmFiles);


    return { content: vmSource, files: vmFiles };
};

module.exports = {
    buildTmpl: _buildTmpl,
    buildTypeScript: _buildTypeScript
};
