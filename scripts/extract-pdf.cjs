const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function main() {
  const buffer = fs.readFileSync("C:/Users/Harshit/Downloads/BCNwiseStockDetails.pdf");
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  const text = result.text || "";
  fs.writeFileSync("prisma/busy-stock-extract.txt", text);
  console.log("Chars:", text.length);
  console.log(text.slice(0, 20000));
}

main().catch(console.error);
