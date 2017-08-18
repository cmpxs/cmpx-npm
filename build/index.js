
var path = require('path'),
  fs = require('fs');

//cmpx-loader
var cmpx = require('cmpx'),
  CompileRender = cmpx.CompileRender;

var _vmRegex = /(\s*@VMComponet\s*\((?:\n|\r|\s)*\{)((?:\n|\r|.)*?)(\}(?:\n|\r|\s)*\)(?:\n|\r|\s)*(?:\w+\s+)*class(?:\n|\r|\s)+(?:\w+\s+)+extends(?:\n|\r|\s)+(?:\w+\s*)+)/gmi,
  _vmContentRegex = /(^(?:\n|\r|\s)*|\,(?:\n|\r|\s)*)(tmplUrl|tmpl|styleUrl)\s*\:\s*([`"'])((?:\n|\r|.)*)\3((?:\n|\r|\s)*$|(?:\n|\r|\s)*\,)/mgi,
  _vmStrGGRegex = /\\(.)/mg;

var _renderRegex = /\s*\$render\s*\(\s*(([`])[^`]*?\2)/gmi,
  _renderRegex2 = /\s*\$render\s*\(\s*((["']).*\2)/gmi;

var _buildRegex = /##%(tmpl|tmplUrl|styleUrl|\$render)%\$\-\[([^\]]*?)\]/gmi;

var _buildTmpl = function (tmpl) {

  return new CompileRender(tmpl).contextFn.toString().replace(/function [^(]*/, 'function');

}, _escapeTmpl = function (name, content) {

  return ['##%', name, "%$-[", encodeURIComponent(content), ']'].join('');

}, _escapeVM = function (resourcePath, source, encoding) {
  let files = [];
  encoding || (encoding = 'utf-8');
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
  if (_renderRegex.test(source)) {
    source = source.replace(_renderRegex, function (find, tmpl, split) {
      find = find.replace(tmpl, _escapeTmpl('$render', tmpl.substr(1, tmpl.length - 2)));
      return find;
    });
  }
  if (_renderRegex2.test(source)) {
    source = source.replace(_renderRegex2, function (find, tmpl, split) {
      find = find.replace(tmpl, _escapeTmpl('$render', tmpl.substr(1, tmpl.length - 2)));
      return find;
    });
  }

  return { vmSource: source, vmFiles: files };

}, _buildTypeScript = function (resourcePath, source, encoding) {

  let { vmSource, vmFiles } = _escapeVM(resourcePath, source, encoding);

  if (_buildRegex.test(vmSource)) {
    vmSource = vmSource.replace(_buildRegex, function (find, type, content) {
      content = decodeURIComponent(content);
      content = content.replace(_vmStrGGRegex, '$1');
      return _buildTmpl(content);
    });
  }

  return { content: vmSource, files: vmFiles };
};

module.exports = {
  buildTmpl: _buildTmpl,
  buildTypeScript: _buildTypeScript
};