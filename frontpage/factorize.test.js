const { column_vector, update_latent_feature } = require('./factorize')

test('Should return column vector', () => {
    const column = column_vector([[3,5,3,1],[4,5,2,2],[1,2,3,4],[4,3,2,1]], 2)
    expect(column).toStrictEqual([3,2,3,2])
})

test('Should calculate updated latent feature', () => {
    const updated_latent = update_latent_feature(1, 2, 5, 0.002, 0.002)
    expect(updated_latent).toStrictEqual(1.039996)
})