// find a smallest integer multiplier for number to produce an integer result with some allowed error
export function multiplier(number: number, error = 0) {
  let remaining = number
  const coefficients = []
  while (true) {
    const integer = Math.floor(remaining)
    remaining = 1 / (remaining - integer)
    coefficients.push(integer)

    const [, denominator] = coefficients.reduceRight(
      ([numerator, denominator], coefficient) => [denominator + numerator * coefficient, numerator],
      [1, 0],
    )

    const multiplied = number * denominator
    if (Math.abs(multiplied - Math.round(multiplied)) < error) return denominator
  }
}
