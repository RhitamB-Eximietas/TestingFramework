window.jsPDF = window.jspdf.jsPDF;

document.addEventListener('DOMContentLoaded', function () {
    const element = document.getElementById('pdf'); 
    html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('converted-document.pdf');
    }).catch(error => {
        console.error('Error generating PDF:', error);
    });
});