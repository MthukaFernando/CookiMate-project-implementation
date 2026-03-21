// app/__tests__/setup.test.js
describe('Jest Setup Verification', () => {
    test('Jest is working correctly', () => {
        expect(true).toBe(true);
    });

    test('Basic math operations work', () => {
        const sum = 2 + 2;
        expect(sum).toBe(4);
    });
});