const { column_vector, update_latent_feature, make_factor_matrix, find_rmse } = require('./factorize')

//Integration test of column_vector from factorize
test('Should return column vector', () => {
    const column = column_vector([[3,5,3,1],[4,5,2,2],[1,2,3,4],[4,3,2,1]], 2)
    expect(column).toStrictEqual([3,2,3,2])
});

//Unit test af update_latent_feature
test('Should calculate updated latent feature', () => {
    const updated_latent = update_latent_feature(1, 2, 5, 0.002, 0.002)
    expect(updated_latent).toStrictEqual(1.039996)
});

//Integration test make_factor_matrix
test('Should make a new matrix with giving parameters', () => {
    const factor_matrix = make_factor_matrix(5,4)
    expect(factor_matrix).toHaveLength(4);
    expect(factor_matrix[0]).toHaveLength(5);
});


//Integration test of RMSE
test('Should calculate the total error', () => {
    const matrix = [[4,4,2,1],[4,2,1,4],[5,3,5,6],[4,5,6,4]];
    const factor_matrix_A = [[2,1],[4,5],[1,3],[5,4]];
    const factor_matrix_B = [[4,2,3,1],[5,4,3,1]];
    const rmse = find_rmse(matrix, factor_matrix_A, factor_matrix_B, 4, 4);
    expect(rmse).toStrictEqual(233);
});