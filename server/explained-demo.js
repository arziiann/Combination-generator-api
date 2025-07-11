function generatePrefixes(n) {
    if (n > 26) {
      throw new Error("Maximum 26 groups supported (A-Z)");
    }
    return [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].slice(0, n);
  }
  
  function countBits(mask) {
    let count = 0;
    while (mask) {
      count += mask & 1;
      mask >>= 1;
    }
    return count;
  }
  
  function cartesianProduct(arrays) {
    /*
    1 call =>  arrays = [
                ['A1'],          // group A
                ['B1', 'B2']     // group B
            ]

    2 call =>  arrays = [ 
                ['A1'],          // group A
                ['C1']           // group C
            ]

    3 call =>   arrays = [
                ['B1', 'B2'],   // group B
                ['C1']          // group C
            ]
    */
    if (arrays.length === 0) return [];
    let result = [[]];
    for (const array of arrays) {
        // array = [A1]
        // array = ['B1', 'B2']

        //array = [A1]
        //array = [C1]

        //array = ['B1', 'B2']
        //array = ['C1']

      const newResult = [];
      for (const combo of result) {
         //combo = []
         //combo = ['A1']

         //combo = []
         //combo = ['A1']

         // combo = []
         // combo = ['B1'], ['B2']

        for (const item of array) {
          newResult.push([...combo, item]);
            //item = 'A1' => [...combo, item] = ['A1']
            // newResult = [['A1']]

            //item = 'B1' => [...combo, item] = ['A1', 'B1']
            //item = 'B2' => [...combo, item] = ['A1', 'B2']

            // item = 'A1' → [...[], 'A1'] = ['A1']
            // newResult = [['A1']]

            // item = 'C1' → [...['A1'], 'C1'] = ['A1', 'C1']
            // newResult = [['A1', 'C1']]

            // item = 'B1' → ['B1']
            // item = 'B2' → ['B2']
            // newResult = [['B1'], ['B2']]

            // item = 'C1' → ['B1', 'C1']
            // item = 'C1' → ['B2', 'C1']
            // newResult = [['B1', 'C1'], ['B2', 'C1']]
        }
        //newResult = [['A1', 'B1'], ['A1', 'B2']]
      }
      result = newResult;
      //result = [['A1']]
      //result = [['A1', 'B1'], ['A1', 'B2']]

      //result = [['A1']]
      //result = [['A1', 'C1']]

      //result = [['B1'], ['B2']]
      //result = [['B1', 'C1'], ['B2', 'C1']]
    }
    return result;
  }
  
  function buildGroups(inputArray, prefixes) {
    //inputArray = [1, 2, 1]
    //prefixes = "A, B, C"
    const groups = {};
    const allItems = [];
  
    for (let i = 0; i < inputArray.length; i++) { 
      const prefix = prefixes[i]; //i0:A, i1:B, i2:C
      const count = inputArray[i];//i0:1, i1:2, i2:1
      if (count <= 0) continue;
  
      groups[prefix] = []; /*grops{A : [A1],
                                   B : [B1, B2],
                                   C : [C1]
      }*/
      for (let j = 1; j <= count; j++) {
        const item = `${prefix}${j}`;
        groups[prefix].push(item);
        allItems.push(item);
      }
    }
    //allItems => A1, B1, B2, C1
    const groupKeys = Object.keys(groups); // groupKeys => A, B, C
    return { groups, groupKeys, allItems };
  }
  
  function generateCombinations(inputArray, comboLength) {
    const prefixes = generatePrefixes(inputArray.length); 
    // inputArray.length = 3
    //prefixes = "ABC"
    //comboLength = 2
    const { groups, groupKeys, allItems } = buildGroups(inputArray, prefixes);
    /*groups = { 
        Group A: [ 'A1' ]
        Group B: [ 'B1', 'B2' ]
        Group C: [ 'C1' ]
    }
    groupKeys = A, B, C
    allItems = A1, B1, B2, C1
    */
    const result = [];
    const n = groupKeys.length; // n = 3
  
   /* 
    1 << 3  // 0001 << 3 = 1000 => 8
    mask = 0, 0 < 8, ++mask
    mask = 0  → 000
    mask = 1  → 001
    mask = 2  → 010
    mask = 3  → 011 -> countBits(mask) returned 2
    mask = 4  → 100
    mask = 5  → 101 -> countBits(mask) returned 2
    mask = 6  → 110 -> countBits(mask) returned 2
    mask = 7  → 111

   */
    for (let mask = 0; mask < 1 << n; mask++) {
      if (countBits(mask) === comboLength) {  
        console.log("mask" + mask);
        //1.   mask = 3  → 011 
        //2.   mask = 5  → 101 
        //3.   mask = 6  → 110
        const selectedGroups = [];
  
        //n = 3
        //groupKeys = A, B, C
        for (let i = 0; i < n; i++) {
          if (mask & (1 << i)) {
            selectedGroups.push(groups[groupKeys[i]]);
          }
        }
        /* 
            **mask = 3(011)

            i = 0
            mask & (1 << 0) → 011 & 001 = 001 => true
            selectedGroups.push(groups['A']) → ['A1']

            i = 1:
            mask & (1 << 1) → 011 & 010 = 010 => true
            selectedGroups.push(groups['B']) → ['B1', 'B2']

            i = 2:
            mask & (1 << 2) → 011 & 100 = 000 =>  false

            //selectedGroups => [ ['A1'], ['B1', 'B2'] ]

            **mask = 5(101)
            i = 0:
            mask & (1 << 0) → 101 & 001 = 001 => true
            selectedGroups.push(groups['A']) → ['A1']

            i = 1:
            mask & (1 << 1) → 101 & 010 = 000 => false
            skip

            i = 2:
            mask & (1 << 2) → 101 & 100 = 100 => true
            selectedGroups.push(groups['C']) → ['C1']

            //selectedGroups => [ ['A1'], ['C1'] ]
        
            **mask = 6(110)
            i = 0:
            mask & (1 << 0) → 110 & 001 = 000 => false
            skip

            i = 1:
            mask & (1 << 1) → 110 & 010 = 010 => true
            selectedGroups.push(groups['B']) → ['B1', 'B2']

            i = 2:
            mask & (1 << 2) → 110 & 100 = 100 => true
            selectedGroups.push(groups['C']) → ['C1']
            //selectedGroups => [ ['B1', 'B2'], ['C1'] ] 

        */
        
        const combinations = cartesianProduct(selectedGroups);
        //combinations = cartesianProduct([['A1'], ['B1', 'B2']])
        //combinations = cartesianProduct([[ ['A1'], ['C1'] ] )
        result.push(...combinations);
      }
    }
  
    return {
      items: allItems,
      combinations: result,
    };
    //items = ['A1', 'B1', 'B2', 'C1']
    //result = [['A1', 'B1'], ['A1', 'B2'], ['A1', 'C1'], ['B1', 'C1'], ['B2', 'C1']]
  }
  
  const inputArray = [2, 1, 3, 2];
  const comboLength = 3;
  
  const { items, combinations } = generateCombinations(inputArray, comboLength);
  
  console.log("All items:");
  console.log(items);
  
  console.log(`\nGenerated combinations of ${comboLength} groups:`);
  combinations.forEach((combo, index) => {
    console.log(`${index + 1}: ${combo.join(', ')}`);
  });
  

    //nCk = C(n, k) = n! / (k!(n - k)!)
    //nCk = C(3, 2) = 3! / (2! * 1!) = 3

    //A, B, C

    // A + B
    // A + C
    // B + C

//3 different group-combination

/*
    A = ['A1']          → length = 1
    B = ['B1', 'B2']    → length = 2
    C = ['C1']          → length = 1

    A + B → 1 × 2 = 2

    A + C → 1 × 1 = 1

    B + C → 2 × 1 = 2

    2 + 1 + 2 = 5
*/
  
