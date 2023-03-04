const addSum = (a, b) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (typeof a !== 'number' || typeof b !== 'number') {
                reject('a,b must be numbers');
            }
            resolve(a + b)
        }, 1000);
    })
}

// addSum(10, 20)
//     .then((sum) => console.log({ sum }))
//     .catch((error) => console.log({ error }))

// addSum(10, "a")
//     .then((sum) => console.log({ sum }))
//     .catch((error) => console.log({ error }))


// addSum(10, 20)
//     .then(sum1 => addSum(sum1, 15))
//     .then(sum2 => console.log({ sum2 }))
//     .catch((error) => console.log({ error }))


// addSum(10, 20)
//     .then(sum1 => {
//         console.log({ sum1 })
//         return addSum(sum1, 'sd')
//     })
//     .then(sum2 => console.log({ sum2 }))
//     .catch((error) => console.log({ error }))

// addSum(10, 20)
//     .then(sum => addSum(sum, 1))
//     .then(sum => addSum(sum, 1))
//     .then(sum => addSum(sum, 1))
//     .then(sum => addSum(sum, 1))
//     .then(sum => addSum(sum, 1))
//     .then(sum => console.log({ sum }))
//     .catch((error) => console.log({ error }))


addSum(10, 10)
    .then(sum1 => {
        sum1_ = sum1
        return addSum(sum1, 10)
    })
    .then(sum2 => {
        sum2_ = sum2
        console.log({ sum2 })
    })

const totalSum = async () => {
    try {
        let sum = await addSum(10, 10)
        let sum2 = await addSum(sum, 10)

        console.log({ sum2 })

    } catch (err) {
        if (err) console.log({ err })

    }
}

totalSum();
// console.log(totalSum())
