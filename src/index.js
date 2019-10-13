const { compact } = require('lodash');
function eval() {
    // Do not use eval!!!
    return;
}


function calcSum(s) {
    var total = 0;
    s = String(s).replace('--', '+').match(/[+\-]?([0-9\.\s]+)/g) || [];
    while(s.length) total += parseFloat(s.shift());
    return total;
}

function checkBracers(readyExp) {
    return !!compact(
        readyExp.match(/[(]{1}[\d\s+-/*]+[)]{1}/gm)
    ).length;
}

function checkHardCalc(readyExp) {
    return !!compact(
        readyExp.match(/([-]?\d*[.]?\d*)([\/])([-]?\d*[.]?\d*)|([-]?\d*[.]?\d*)([*])([-]?\d*[.]?\d*)/g)
    ).length;
}

function calculateHardCalc(brace) {
    const reques = compact(
        brace.match(/(\d*[.]?\d*)([\/])([-]?\d*[.]?\d*)|(\d*[.]?\d*)([*])([-]?\d*[.]?\d*)/m)
    );
    const result = reques
        .map(req => {
                return compact(
                    req.match(/([-]?\d+([.]*\d+)*)|([/*]{1})|([-]?\d+([.]*\d+)*)/gm)
                ).reduce((previousValue, currentValue, index, array) => {
                    if (index === 0) return currentValue;
                    if (currentValue === '*' || currentValue === '/') return previousValue;
                    if (array[1] === '*') {
                        return parseFloat(previousValue) * parseFloat(currentValue)
                    }
                    if (array[1] === '/') {
                        const cur = parseFloat(currentValue);
                        if (cur === 0) throw new Error('TypeError: Division by zero.')
                        else return parseFloat(previousValue) / cur;
                    }
                });
            }
        );
    let res = brace;
    reques.forEach((req, i) => {
        res = res.replace(req, result[i]);
    });
    return checkHardCalc(res) ? calculateHardCalc(res) : calcSum(res);
}

function testBracers(expr) {
    const left = expr.match(/\(/gm) || [];
    const right = expr.match(/\)/gm) || [];
    if (left.length !== right.length) throw new Error('ExpressionError: Brackets must be paired');
}

function calculateBracers(expr) {
    const readyExp = expr.replace(/\s/gm, '');
    testBracers(readyExp);
    const bracersMatch = compact(readyExp.match(/[(]{1}[\d\s+-/*]+[)]{1}/gm));
    if (!checkBracers(readyExp)) {
        if (!checkHardCalc(readyExp)) {
            return readyExp;
        } else {
            return calculateHardCalc(readyExp);
        }
    }

    const bracers = bracersMatch.map(brace => brace.replace(/[()]/gm, ''));
    const reqs = bracers.map(brace => checkHardCalc(brace) ? calculateHardCalc(brace) : calcSum(brace));

    let fullExp = readyExp;

    bracersMatch.forEach((brace, i) => {
        fullExp = fullExp.replace(brace, reqs[i]);
    });

    return calculateBracers(fullExp);
}

function expressionCalculator(exp) {
    return calcSum(calculateBracers(exp));
}

module.exports = {
    expressionCalculator
}