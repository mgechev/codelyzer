import * as ts from 'typescript';

function computeLineStarts(text: string): number[] {
    let result: number[] = new Array();
    let pos = 0;
    let lineStart = 0;
    while (pos < text.length) {
       let ch = text.charCodeAt(pos++);
       switch (ch) {
            case 0x0D:
                if (text.charCodeAt(pos) === 0x0A) {
                    pos++;
                }
            case 0x0A:
                result.push(lineStart);
                lineStart = pos;
                break;
            default:
                if (ch > 0x7F && ts.isLineBreak(ch)) {
                    result.push(lineStart);
                    lineStart = pos;
                }
                break;
        }
    }
    result.push(lineStart);
    return result;
}

export class ScriptInfo {
    public version: number = 1;
    public editRanges: { length: number; textChangeRange: ts.TextChangeRange; }[] = [];

    constructor(public fileName: string, public content: string, public isOpen = true) {
        this.setContent(content);
    }

    private setContent(content: string): void {
        this.content = content;
    }

    public updateContent(content: string): void {
        var old_length = this.content.length;
        this.setContent(content);
        this.editRanges.push({
            length: content.length,
            textChangeRange:
                // NOTE: no shortcut for "update everything" (null only works in some places, #10)
                ts.createTextChangeRange(ts.createTextSpan(0,old_length),content.length)
        });
        this.version++;
    }

    public editContent(minChar: number, limChar: number, newText: string): void {
        // Apply edits
        var prefix = this.content.substring(0, minChar);
        var middle = newText;
        var suffix = this.content.substring(limChar);
        this.setContent(prefix + middle + suffix);

        // Store edit range + new length of script
        this.editRanges.push({
            length: this.content.length,
            textChangeRange:
              ts.createTextChangeRange( ts.createTextSpanFromBounds(minChar, limChar)
                                      , newText.length)
        });

        // Update version #
        this.version++;
    }

    public getTextChangeRangeBetweenVersions(startVersion: number, endVersion: number): ts.TextChangeRange {
        if (startVersion === endVersion) {
            // No edits!
            return ts.unchangedTextChangeRange;
        }

        var initialEditRangeIndex = this.editRanges.length - (this.version - startVersion);
        var lastEditRangeIndex = this.editRanges.length - (this.version - endVersion);

        var entries = this.editRanges.slice(initialEditRangeIndex, lastEditRangeIndex);
        return ts.collapseTextChangeRangesAcrossMultipleVersions(entries.map(e => e.textChangeRange));
    }
}

export class ScriptSnapshot implements ts.IScriptSnapshot {
    private lineMap: number[] = null;
    private textSnapshot: string;
    private version: number;

    constructor(private scriptInfo: ScriptInfo) {
        this.textSnapshot = scriptInfo.content;
        this.version = scriptInfo.version;
    }

    public getText(start: number, end: number): string {
        return this.textSnapshot.substring(start, end);
    }

    public getLength(): number {
        return this.textSnapshot.length;
    }

    private getLineStartPositions(): number[] {
        if (this.lineMap === null) {
            this.lineMap = computeLineStarts(this.textSnapshot);
        }

        return this.lineMap;
    }

    public getChangeRange(oldSnapshot: ts.IScriptSnapshot): ts.TextChangeRange {
        return undefined;
    }
}