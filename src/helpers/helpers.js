const firstUpper = (text) => {
    const array = text.split(' ');
    const capitalizedValues = [];
    array.forEach((word, index) => {
        capitalizedValues.push(array[index][0].toUpperCase() + array[index].slice(1).toLowerCase());
    })
    return capitalizedValues.join(' ');
}


module.exports = { firstUpper };