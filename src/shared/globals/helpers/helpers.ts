export class Helpers {
  //when we user static methods we do not have to create a instance of it.
  //only
  //Helper.firstLetterUppercase()
  //instead of
  // const helper= new Helpers()
  //helper.firstLetterUppercase()
  static firstLetterUppercase(str: string): string {
    const valueString = str.toLocaleLowerCase();
    return valueString
      .split(' ')
      .map((value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLocaleLowerCase()}`)
      .join(' ');
  }
  static lowerCase(str: string): string {
    return str.toLocaleLowerCase();
  }
  static generateRandomIntegers(integerLength: number): number {
    const characters = '0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < integerLength; i++) {
      result += characters.charAt(Math.random() * charactersLength);
    }
    return parseInt(result, 10);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static parseJson(prop: string): any {
    try {
      return JSON.parse(prop);
    } catch (error) {
      return prop;
    }
  }
}
