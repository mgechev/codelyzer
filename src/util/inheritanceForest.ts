/**
 * A simple forest for building inheritance forests for a class hierarchy.
 */
export class InheritanceForest {
  private forest = new Map<string, string[]>();

  constructor() {
  }

  /**
   * Add a new inheritance info for a class.
   */
  public add(derived: string, bases: string[]): this {
    // Add a new base
    if (!this.forest.has(derived)) {
      this.forest.set(derived, bases);
    } else {
      const existingBases = this.forest.get(derived);
      const newBases = [...existingBases, ...bases];
      this.forest.set(derived, newBases);
    }
    // Add derived to the forest if it doesn't exist
    bases.forEach(base => {
      if (!this.forest.has(base)) {
        this.forest.set(base, null);
      }
    });
    return this;
  }

  /**
   * Get all classes/interfaces which `klass` extends/implements (walks up the whole tree).
   * May contain duplicates.
   */
  public getHeritage(klass: string, includeSelf: boolean = false, current: string[] = []): string[] {
    if (this.forest.get(klass) == null) {
      return includeSelf ? [klass] : [];
    } else {
      const heritage = this.forest.get(klass)
        .map(k => this.getHeritage(k, true, current))
        .reduce((acc, curr) => [...acc, ...curr], []);
      return includeSelf ? [...current, klass, ...heritage] : [...current, ...heritage];
    }
  }

  /**
   * Includes both "from" and "to". Goes upstream (from derived to base).
   * Returns `null` if no path exists.
   */
  public getPath(from: string, to: string): string[] {
    // Destination found
    if (from == to) return [from];
    // Root reached, destination not found
    if (this.forest.get(from) == null) return null;
    // Check all ancestors
    for (const base of this.forest.get(from)) {
      const result = this.getPath(base, to);
      if (result) {
        // result found from one of ancestor, return currently known path
        return [from, ...result];
      }
    }
    // Checked all ancestors and nothing found
    return null;
  }

  public toString(): string {
    return this.forest.toString();
  }
}
