const assert=require("node:assert/strict");
const {numberToSpanish,makeQuestion}=require("./math.js");

const cases={
  0:"cero",16:"dieciséis",21:"veintiuno",22:"veintidós",26:"veintiséis",31:"treinta y uno",
  100:"cien",101:"ciento uno",500:"quinientos",700:"setecientos",900:"novecientos",
  1000:"mil",21000:"veintiún mil",31000:"treinta y un mil",101000:"ciento un mil",
  999999:"novecientos noventa y nueve mil novecientos noventa y nueve",1000000:"un millón"
};
for(const [value,words] of Object.entries(cases))assert.equal(numberToSpanish(Number(value)),words);
assert.throws(()=>numberToSpanish(-1),RangeError);
assert.throws(()=>numberToSpanish(1000001),RangeError);

for(const level of ["easy","medium","hard"]){
  for(const operator of ["+","−","×","÷"]){
    for(let i=0;i<1000;i++){
      const q=makeQuestion(level,Math.random,operator);
      assert.ok(Number.isInteger(q.answer),`${level} ${operator} answer should be an integer`);
      assert.ok(q.answer>=0&&q.answer<=1000000,`${level} ${operator} answer out of range`);
      if(operator==="−")assert.ok(q.left>=q.right,"subtraction must be non-negative");
      if(operator==="÷")assert.equal(q.left%q.right,0,"division must be exact");
    }
  }
}
console.log("Math tests passed");
