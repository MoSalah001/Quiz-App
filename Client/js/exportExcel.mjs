export function exportToExcel(tableID) {
    const table = document.getElementById('table')
    let file = XLSX.utils.table_to_book(table,{sheet: 'sheet1'})
    XLSX.write(file,{booktype: 'xlsx', bookSST: true,type: 'base64'})
    XLSX.writeFile(file,'test.xlsx')
}