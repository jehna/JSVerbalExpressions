const { expect } = chai;

describe('VerEx', () => {
    describe('Constructor', () => {
        it('Should extend RegExp', () => {
            expect(VerEx()).to.be.instanceOf(RegExp);
        });

        it('Should start with empty regex with global multiline matching', () => {
            expect(VerEx().toString()).to.equal('/(?:)/gm');
        });
    });

    describe('.sanitize()', () => {
        it('should sanitize special characters', () => {
            const testString = '$a^b\\c|d(e)f[g]h{i}j.k*l+m?n:o=p';
            const escaped =
                '\\$a\\^b\\\\c\\|d\\(e\\)f\\[g\\]h\\{i\\}j\\.k\\*l\\+m\\?n\\:o\\=p';
            expect(VerEx().sanitize(testString)).to.equal(escaped);
        });

        it('should not escape numbers', () => {
            expect(VerEx().sanitize(42)).to.equal(42);
        });

        it('should stringify regular expressions', () => {
            expect(VerEx().sanitize(/foo/)).to.equal('foo');
        });

        it('should not throw on special cases', () => {
            expect(() => VerEx().sanitize()).to.not.throw();
            expect(() => VerEx().sanitize(NaN)).to.not.throw();
            expect(() => VerEx().sanitize(null)).to.not.throw();
            expect(() => VerEx().sanitize(true)).to.not.throw();
        });
    });

    describe('.add()', () => {
        it('should retain old prefixes, suffixes and modifiers', () => {
            const testRegex = VerEx().startOfLine().withAnyCase().endOfLine();
            testRegex.add('(?:foo)?');

            expect(testRegex.source.startsWith('^')).to.be.true;
            expect(testRegex.source.endsWith('$')).to.be.true;
            expect(testRegex.flags).to.include('i');
        });

        it('should add new rules', () => {
            const testRegex = VerEx().startOfLine().withAnyCase().endOfLine();
            testRegex.add('(?:foo)?');

            expect(testRegex.test('foo')).to.be.true;
        });

        it('should add new rules', () => {
            const testRegex = VerEx().startOfLine().withAnyCase().endOfLine();
            testRegex.add('(?:foo)?');

            expect(testRegex.test('')).to.be.true;
        });
    });

    describe('.startOfLine()', () => {
        it('should match start of line', () => {
            const regex = VerEx().startOfLine().then('a');
            expect(regex.test('ab')).to.be.true;
        });

        it('should not match other than start of line', () => {
            const regex = VerEx().startOfLine().then('a');
            expect(regex.test('ba')).to.be.false;
        });

        it('should be able to match other than start of line after setting to false', () => {
            const regex = VerEx().startOfLine().then('a');
            regex.startOfLine(false);
            expect(regex.test('ba')).to.be.true;
        });
    });

    describe('.endOfLine()', () => {
        it('should match end of line', () => {
            const regex = VerEx().find('a').endOfLine();
            expect(regex.test('ba')).to.be.true;
        });

        it('should not match other than end of line', () => {
            const regex = VerEx().find('a').endOfLine();
            expect(regex.test('ab')).to.be.false;
        });

        it('should be able to match other than start of line after setting to false', () => {
            const regex = VerEx().find('a').endOfLine();
            regex.endOfLine(false);
            expect(regex.test('ab')).to.be.true;
        });
    });

    for (const name of ['then', 'find']) {
        describe(`.${name}()`, () => {
            it('should match a simple character', () => {
                const regex = VerEx()[name]('a');
                expect(regex.test('a')).to.be.true;
                expect(regex.test('b')).not.to.be.true;
            });

            it('should not match a character from empty string', () => {
                const regex = VerEx()[name]('a');
                expect(regex.test('')).not.to.be.true;
            });

            it(`should be able to join two .${name}() calls`, () => {
                const regex = VerEx()[name]('a')[name]('b');
                expect(regex.test('ab')).to.be.true;
                expect(regex.test('bc')).not.to.be.true;
            });
        });
    }

    describe('.maybe()', () => {
        it('should match if the string inside maybe is found', () => {
            const regex = VerEx().startOfLine().then('a').maybe('b').then('c');
            expect(regex.test('abc')).to.be.true;
        });

        it('should match if the string inside maybe is not found but other part matches', () => {
            const regex = VerEx().startOfLine().then('a').maybe('b').then('c');
            expect(regex.test('ac')).to.be.true;
        });
    });

    describe('.or()', () => {
        it('should match the first part', () => {
            const regex = VerEx().startOfLine().then('abc').or('def');
            expect(regex.test('abczzz')).to.be.true;
        });

        it('should match the second part', () => {
            const regex = VerEx().startOfLine().then('abc').or('def');
            expect(regex.test('defzzz')).to.be.true;
        });

        it('should match modifiers with first part', () => {
            const regex = VerEx().startOfLine().then('abc').or('def');
            expect(regex.test('zzzabc')).not.to.be.true;
        });

        it('should not match modifiers from first part with the second part', () => {
            const regex = VerEx().startOfLine().then('abc').or('def');
            expect(regex.test('zzzdef')).to.be.true;
        });

        it('should not match modifiers from first part with the second part', () => {
            const regex = VerEx().startOfLine().then('abc').or('def');
            expect(regex.test('zzzdef')).to.be.true;
        });

        it('should accept .or() as empty delimiter', () => {
            const regex = VerEx().startOfLine().then('abc').or().then('def');
            expect(regex.test('zzzdef')).to.be.true;
        });
    });

    describe('.anything()', () => {
        it('should match any characters', () => {
            const regex = VerEx().startOfLine().anything();
            expect(regex.test('foo')).to.be.true;
        });
        it('should match zero characters', () => {
            const regex = VerEx().startOfLine().anything();
            expect(regex.test('')).to.be.true;
        });
    });

    describe('.anythingBut()', () => {
        it('should not match if found any characters in any order', () => {
            const regex = VerEx().startOfLine().anythingBut('br').endOfLine();
            expect(regex.test('foobar')).not.to.be.true;
        });

        it('should match if all characters are omitted', () => {
            const regex = VerEx().startOfLine().anythingBut('br').endOfLine();
            expect(regex.test('foo_a_')).to.be.true;
        });

        it('Should be able to match zero characters', () => {
            const regex = VerEx().startOfLine().anythingBut('br');
            expect(regex.test('bar')).to.be.true;
        });
        it('should not match if found any characters from array in any order', () => {
            const regex = VerEx()
                .startOfLine()
                .anythingBut(['b', 'r'])
                .endOfLine();
            expect(regex.test('foobar')).not.to.be.true;
        });

        it('should match if all characters from array are omitted', () => {
            const regex = VerEx()
                .startOfLine()
                .anythingBut(['b', 'r'])
                .endOfLine();
            expect(regex.test('foo_a_')).to.be.true;
        });

        it('Should be able to match zero characters', () => {
            const regex = VerEx().startOfLine().anythingBut(['b', 'r']);
            expect(regex.test('bar')).to.be.true;
        });
    });

    describe('.something()', () => {
        it('should match any non-empty string', () => {
            const regex = VerEx().something();
            expect(regex.test('a')).to.be.true;
        });

        it('should not match an empty string', () => {
            const regex = VerEx().something();
            expect(regex.test('')).not.to.be.true;
        });
    });
});
