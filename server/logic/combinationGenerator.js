class Helper {
  static generatePrefixes(n) {
    if (n > 26) {
      throw new Error("Maximum 26 groups supported (A-Z)");
    }
    return [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].slice(0, n);
  }

  static countBits(mask) {
    let count = 0;
    while (mask) {
      count += mask & 1;
      mask >>= 1;
    }
    return count;
  }

  static cartesianProduct(arrays) {
    if (arrays.length === 0) return [];
    let result = [[]];
    for (const array of arrays) {
      const newResult = [];
      for (const combo of result) {
        for (const item of array) {
          newResult.push([...combo, item]);
        }
      }
      result = newResult;
    }
    return result;
  }
}

class CombinationGenerator {
  constructor(inputArray, comboLength) {
    this.inputArray = inputArray;
    this.comboLength = comboLength;
    this.groups = {};
    this.prefixes = Helper.generatePrefixes(inputArray.length);
    this.groupKeys = [];
    this.generatedItems = [];
  }

  buildGroups() {
    const allItems = [];
    for (let i = 0; i < this.inputArray.length; i++) {
      const prefix = this.prefixes[i];
      const count = this.inputArray[i];
      if (count <= 0) continue;

      this.groups[prefix] = [];
      for (let j = 1; j <= count; j++) {
        const item = `${prefix}${j}`;
        this.groups[prefix].push(`${prefix}${j}`);
        allItems.push(item);
      }
    }
    this.groupKeys = Object.keys(this.groups);
    this.generatedItems = [...allItems];
  }

  generate() {
    this.buildGroups();

    const result = [];
    const n = this.groupKeys.length;

    for (let mask = 0; mask < 1 << n; mask++) {
      if (Helper.countBits(mask) === this.comboLength) {
        const selectedGroups = [];

        for (let i = 0; i < n; i++) {
          if (mask & (1 << i)) {
            selectedGroups.push(this.groups[this.groupKeys[i]]);
          }
        }

        const combinations = Helper.cartesianProduct(selectedGroups);
        result.push(...combinations);
      }
    }

    return {
      items: this.generatedItems,
      combinations: result,
    };
  }
}

export default CombinationGenerator;
