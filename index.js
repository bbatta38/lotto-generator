window.onload = () => {
  axios.get("/lotto-generator/numbers.json").then((value) => {
    const BL = [];
    const OR = [];
    const GR = [];
    const RD = [];
    const patterns = value.data
      .map((da) => {
        return da.num
          .map((n) => {
            if (n > 0 && n < 10) {
              BL.push(n);
              return "BL";
            } else if (n >= 10 && n < 20) {
              OR.push(n);
              return "OR";
            } else if (n >= 20 && n < 30) {
              GR.push(n);
              return "GR";
            } else if (n >= 30 && n < 40) {
              RD.push(n);
              return "RD";
            } else {
              return "MG";
            }
          })
          .join("-");
      })
      .reduce((a, d) => {
        const existedPattern = a.find((pt) => pt.pattern === d);
        if (existedPattern) {
          existedPattern.total += 1;
          existedPattern.percentage = Math.round(
            (existedPattern.total / value.data.length) * 100
          );
        } else {
          a.push({ pattern: d, total: 1, percentage: 0 });
        }
        return a;
      }, [])
      .sort((a, b) => b.total - a.total);
    // const evenNumbers = value.data
    //   .map((da) => da.num.reduce((a, n) => (n % 2 === 0 ? a + 1 : a), 0))
    //   .reduce((a, b) => {
    //     const existedNumber = a.find((even) => even.number === b);
    //     if (existedNumber) {
    //       existedNumber.total += 1;
    //       existedNumber.percentage = Math.round(
    //         (existedNumber.total / value.data.length) * 100
    //       );
    //     } else {
    //       a.push({ number: b, total: 1, percentage: 0 });
    //     }
    //     return a;
    //   }, []);

    const powers = value.data
      .reduce((a, d) => {
        const existedPower = a.find((po) => po.power === d.power);
        if (existedPower) {
          existedPower.total += 1;
          existedPower.percentage = Math.round(
            (existedPower.total / value.data.length) * 100
          );
        } else {
          a.push({ power: d.power, total: 1, percentage: 0 });
        }
        return a;
      }, [])
      .sort((a, b) => b.total - a.total);

    const getProbability = (a, d) => {
      const existedNumber = a.find((pt) => pt.num === d);
      if (existedNumber) {
        existedNumber.total += 1;
        existedNumber.percentage = Math.round(
          (existedNumber.total / value.data.length) * 100
        );
      } else {
        a.push({ num: d, total: 1, percentage: 0 });
      }
      return a;
    };
    const bl = BL.reduce(getProbability, []).sort((a, b) => b.total - a.total);
    const or = OR.reduce(getProbability, []).sort((a, b) => b.total - a.total);
    const gr = GR.reduce(getProbability, []).sort((a, b) => b.total - a.total);
    const rd = RD.reduce(getProbability, []).sort((a, b) => b.total - a.total);

    new App({ patterns, powers, bl, or, gr, rd });
    // new App({ patterns, powers, bl, or, gr, rd, evenNumbers });
  });
};

class App {
  constructor(data) {
    this.powers = data.powers;
    this.patterns = data.patterns;
    // this.evenNumbers = data.evenNumbers;
    this.BL = data.bl;
    this.OR = data.or;
    this.GR = data.gr;
    this.RD = data.rd;
    const btn = document.getElementById("numberClickBtn");
    // this.even = this.getChanceByPercentage(this.evenNumbers).number;
    btn.addEventListener("click", this.getNumber.bind(this), false);
  }

  getNumber = (e) => {
    const powerball = this.getChanceByPercentage(this.powers);
    this.totalPattern = this.getChanceByPercentage(this.patterns).pattern;
    const patternArray = this.totalPattern.split("-");
    const pickedNum = this.getNumbersByPattern(this.totalPattern);
    const container = document.getElementById("lottoNumber");
    const powerballContainer = document.getElementById("powerball");
    powerballContainer.classList.add("ball");
    container.innerHTML = "";
    powerballContainer.innerHTML = "";
    powerballContainer.innerHTML = powerball.power;
    pickedNum.forEach((num, i) => {
      const p = document.createElement("p");
      p.innerHTML = num;
      p.className = `ball ${patternArray[i]}`;
      container.appendChild(p);
    });
  };

  getNumbersByPattern = (pattern) => {
    let tempBL = [...this.BL];
    let tempOR = [...this.OR];
    let tempGR = [...this.GR];
    let tempRD = [...this.RD];

    const patternArray = pattern.split("-");
    const numByPattern = patternArray.map((pt) => {
      if (pt === "BL") {
        const filtered = this.getFilteredNum(tempBL);
        tempBL = filtered.arr;
        return filtered.num;
      } else if (pt === "OR") {
        const filtered = this.getFilteredNum(tempOR);
        tempOR = filtered.arr;
        return filtered.num;
      } else if (pt === "GR") {
        const filtered = this.getFilteredNum(tempGR);
        tempGR = filtered.arr;
        return filtered.num;
      } else if (pt === "RD") {
        const filtered = this.getFilteredNum(tempRD);
        tempRD = filtered.arr;
        return filtered.num;
      } else {
        return 40;
      }
    });
    const lang = numByPattern.filter((num) => num % 2 === 0).length;
    // while (lang !== this.even || numByPattern.length !== 6) {
    while (lang !== 3 || numByPattern.length !== 6) {
      return this.getNumbersByPattern(this.totalPattern);
    }

    return numByPattern.sort((a, b) => a - b);
    // return numByPattern;
  };

  getFilteredNum = (arr) => {
    const num = this.getChanceByPercentage(arr).num;
    arr = arr.filter((a) => a.num !== num);
    return { num, arr };
  };

  getChanceByPercentage = (arr) => {
    const expanded = arr.flatMap((a) => Array(a.percentage).fill(a));
    return expanded[Math.floor(Math.random() * expanded.length)];
  };
}
