import * as ts from 'typescript';
import * as harness from './harness';

export class FileCache {
  public ls: ts.LanguageService;
  public fileNames: string[] = [];
  public snapshots: ts.Map<ts.IScriptSnapshot> = {};
  public fileNameToScript:ts.Map<harness.ScriptInfo> = {};

  public getFileNames() { return this.fileNames; }

  /**
   * @param fileName resolved name of possibly cached file
   */
  public getScriptInfo(fileName) {
    if (!this.fileNameToScript[fileName]) {
      this.fetchFile(fileName);
    }
    return this.fileNameToScript[fileName];
  }

  /**
   * @param fileName resolved name of possibly cached file
   */
  public getScriptSnapshot(fileName) {
    // console.log("getScriptSnapshot",fileName);
    if (!this.snapshots[fileName]) {
      this.fetchFile(fileName);
    }
    return this.snapshots[fileName];
  }

  /**
   * @param fileName resolved file name
   * @param text file contents
   * @param isDefaultLib should fileName be listed first?
   */
  public addFile(fileName,text,isDefaultLib=false) {
    if (isDefaultLib) {
      this.fileNames.push(fileName);
    } else {
      this.fileNames.unshift(fileName);
    }
    this.fileNameToScript[fileName] = new harness.ScriptInfo(fileName,text);
    this.snapshots[fileName]        = new harness.ScriptSnapshot(this.getScriptInfo(fileName));
  }

  /**
   * @param fileName resolved file name
   */
  public fetchFile(fileName) {
    // console.log("fetchFile:",fileName);
    if (ts.sys.fileExists(fileName)) {
      this.addFile(fileName,ts.sys.readFile(fileName));
    } else {
      // console.error ("tss: cannot fetch file: "+fileName);
    }
  }

  /**
   * @param fileName resolved name of cached file
   * @param line 1 based index
   * @param col 1 based index
   */
  public lineColToPosition(fileName: string, line: number, col: number): number {
      return ts.getPositionOfLineAndCharacter(this.ls.getSourceFile(fileName),line-1, col-1);
  }

  /**
   * @param fileName resolved name of cached file
   * @returns {line,character} 1 based indices
   */
  public positionToLineCol(fileName: string, position: number): ts.LineAndCharacter {
      var lineChar = ts.getLineAndCharacterOfPosition(this.ls.getSourceFile(fileName),position);
      return {line: lineChar.line+1, character: lineChar.character+1 };
  }

  /**
   * @param fileName resolved name of cached file
   * @param line 1 based index
   */
  public getLineText(fileName,line) {
    var source    = this.ls.getSourceFile(fileName);
    var lineStart = ts.getPositionOfLineAndCharacter(source, line - 1, 0);
    var lineEnd   = ts.getPositionOfLineAndCharacter(source, line, 0) - 1;
    var lineText  = source.text.substring(lineStart,lineEnd);
    return lineText;
  }

  /**
   * @param fileName resolved name of possibly cached file
   * @param content new file contents
   */
  public updateScript(fileName: string, content: string) {
      var script = this.getScriptInfo(fileName);
      if (script) {
        script.updateContent(content);
        this.snapshots[fileName] = new harness.ScriptSnapshot(script);
      } else {
        this.addFile(fileName,content);
      }
  }

  /**
   * @param fileName resolved name of cached file
   * @param minChar first char of edit range
   * @param limChar first char after edit range
   * @param newText new file contents
   */
  public editScript(fileName: string, minChar: number, limChar: number, newText: string) {
      var script = this.getScriptInfo(fileName);
      if (script) {
          script.editContent(minChar, limChar, newText);
          this.snapshots[fileName] = new harness.ScriptSnapshot(script);
          return;
      }
      throw new Error(`No script with name "${fileName}".`);
  }
}
