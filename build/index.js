
var path = require('path'),
    fs = require('fs');

//cmpx-loader
var cmpx = require('cmpx'),
    CompileRender = cmpx.CompileRender;


var _tmplRegex = /\s*@VM\s*\((?:\n|\r|\s)*\{(?:\n|\r|.)*?tmpl\s*\:\s*(([`])[^`]*?\2)/gmi,
    _tmplRegex2 = /\s*@VM\s*\((?:\n|\r|\s)*\{(?:\n|\r|.)*?tmpl\s*\:\s*((["']).*\2)/gmi
    _renderRegex = /\s*\$render\s*\(\s*(([`])[^`]*?\2)/gmi,
    _renderRegex2 = /\s*\$render\s*\(\s*((["']).*\2)/gmi
    _tmplUrlRegex = /\s*@VM\s*\((?:\n|\r|\s)*\{(?:\n|\r|.)*?tmplUrl\s*\:\s*((["']).*\2)/gmi,
    _styleUrlRegex = /\s*@VM\s*\((?:\n|\r|\s)*\{(?:\n|\r|.)*?styleUrl\s*\:\s*((["']).*\2)/gmi;

var _buildTmpl =  function(tmpl){

  return new CompileRender(tmpl).contextFn.toString().replace(/function [^(]*/, 'function');

}, _buildTypeScript = function(resourcePath, source, encoding){
  let files = [];
  encoding || (encoding = 'utf-8');
  if(_tmplRegex.test(source)){
    source = source.replace(_tmplRegex, function(find, tmpl, split){
      find = find.replace(tmpl, _buildTmpl(tmpl.substr(1, tmpl.length-2)));
      return find;
    });
  }
  if(_tmplRegex2.test(source)){
    source = source.replace(_tmplRegex2, function(find, tmpl, split){
      find = find.replace(tmpl, _buildTmpl(tmpl.substr(1, tmpl.length-2)));
      return find;
    });
  }
  if(_renderRegex.test(source)){
    source = source.replace(_renderRegex, function(find, tmpl, split){
      find = find.replace(tmpl, _buildTmpl(tmpl.substr(1, tmpl.length-2)));
      return find;
    });
  }
  if(_renderRegex2.test(source)){
    source = source.replace(_renderRegex2, function(find, tmpl, split){
      find = find.replace(tmpl, _buildTmpl(tmpl.substr(1, tmpl.length-2)));
      return find;
    });
  }
  if (_tmplUrlRegex.test(source)){
    source = source.replace(_tmplUrlRegex, (find, tmpl, split)=>{
      let filePath = tmpl.substr(1, tmpl.length-2);
      filePath = path.join(path.dirname(resourcePath), filePath);
      files.push(filePath);
      let fileContent = fs.readFileSync(filePath, encoding);
      find = find.replace(tmpl, _buildTmpl(fileContent));
      return find;
    });
  }
  if (_styleUrlRegex.test(source)){
    source = source.replace(_styleUrlRegex, (find, tmpl, split)=>{
      let filePath = tmpl.substr(1, tmpl.length-2);
      filePath = path.join(path.dirname(resourcePath), filePath);
      files.push(filePath);
      let fileContent = fs.readFileSync(filePath, encoding);
      find = find.replace(tmpl, 'function() { return `'+fileContent+'`; }');
      return find;
    });
  }
  return {content:source, files:files};
}

module.exports = {
    buildTmpl:_buildTmpl,
    buildTypeScript:_buildTypeScript
};