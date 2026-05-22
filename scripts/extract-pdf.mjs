import fs from "fs";
import pdf from "pdf-parse";

const buf = fs.readFileSync("C:/Users/Harshit/Downloads/BCNwiseStockDetails.pdf");
const data = await pdf(buf);
fs.writeFileSync("prisma/busy-stock-extract.txt", data.text);
console.log("Pages:", data.numpages, "Chars:", data.text.length);
console.log("---SAMPLE---");
console.log(data.text.slice(0, 12000));
