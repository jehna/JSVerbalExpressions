const { expect } = chai;

describe('VerEx', () => {
    it('Should extend RegExp', () => {
        expect(VerEx()).to.be.instanceOf(RegExp);
    });

    it('Should start with empty regex with global multiline matching', () => {
        expect(VerEx().toString()).to.equal('/(?:)/gm');
    });
});
