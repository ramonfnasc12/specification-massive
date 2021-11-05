const accountName = "Conta VTEX";
const VtexIdclientAutCookie = "Adicionar Cookie"

const axios = require('axios');
const instance = axios.create({
    headers: {
        VtexIdclientAutCookie,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
})
const array = [];
const csv = require('csv-parser');
const fs = require('fs');
(async () => {
    await new Promise((resolve, reject) => {
        fs.createReadStream('Arquivo CSV com produto, origem e ncm')
        .pipe(csv({
            delimiter: ",",
            columns: ["produto", "origem", "ncm"],
            trim: true
        }))
        .on('data', (row) => array.push(row))
        .on('end', () => {
            console.log('CSV file successfully processed');
            resolve();
        });
    })
    let i = 0;
    for await (const row of array){
        console.log(row)
        await process(row)
    }
})();

async function process(row) {
    const { data: { Id } } = await instance.get(`https://${accountName}.myvtex.com/api/catalog_system/pvt/products/productgetbyrefid/${row.produto}`);
    const response = await instance.post(`https://${accountName}.myvtex.com/api/catalog_system/pvt/products/${Id}/specification`,
        [
            {
                "Value": [
                    `${row.ncm}`
                ],
                "Id": 23, //ID especificação NCM no ambiente desejado
                "Name": "NCM"
            },
            {
                "Value": [
                    `${row.origem}`
                ],
                "Id": 24, //ID especificação Origem no ambiente desejado
                "Name": "Origem"
            }
        ]

    );
    console.log(response.status + " " + row.produto)
}
