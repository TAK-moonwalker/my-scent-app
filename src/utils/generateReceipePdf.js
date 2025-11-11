import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


async function urlToDataUrl(url){
if (!url) return null;
try {
const res = await fetch(url);
const blob = await res.blob();
return await new Promise((resolve)=>{
const fr = new FileReader();
fr.onload = () => resolve(fr.result);
fr.onerror = () => resolve(null);
fr.readAsDataURL(blob);
});
} catch { return null; }
}


export async function generateRecipePdf({ title, totalVolume_ml, status, tags, coverUrl, notes, rows, footer }){
const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
const pageW=210, pageH=297, margin=12; let y=margin;
doc.setProperties({ title: `${title || 'Recipe'}.pdf` });


doc.setFont('helvetica','bold'); doc.setFontSize(18);
doc.text(title || 'Untitled Recipe', margin, y); y+=7;
doc.setFont('helvetica','normal'); doc.setFontSize(10);
const meta = [
`Batch Volume: ${totalVolume_ml} ml`,
status ? `Status: ${status}` : '',
(tags && tags.length) ? `Tags: ${tags.join(', ')}` : ''
].filter(Boolean);
meta.forEach(line => { doc.text(line, margin, y); y += 5; });


const dataUrl = await urlToDataUrl(coverUrl);
if (dataUrl) {
doc.addImage(dataUrl, 'JPEG', pageW - margin - 60, margin, 60, 45, undefined, 'FAST');
y = Math.max(y, margin + 45 + 4);
}


if (notes && notes.trim()) {
doc.setFont('helvetica','bold'); doc.text('Notes', margin, y); y+=5;
doc.setFont('helvetica','normal');
const split = doc.splitTextToSize(notes, pageW - margin*2);
doc.text(split.slice(0,5), margin, y); y += 5 + Math.min(5, split.length)*5;
}


const head = [['#','Material','Parts','% of total','Amount (ml)']];
const body = rows.map((r,i)=>[
String(i+1), r.materialName||'—', (r.parts||0).toFixed(2), `${(r.percentage||0).toFixed(2)} %`, `${(r.amount_ml||0).toFixed(2)} ml`
]);
const totalParts = rows.reduce((s,r)=>s+(Number(r.parts)||0),0);
const sumPct = rows.reduce((s,r)=>s+(Number(r.percentage)||0),0);
const sumMl = rows.reduce((s,r)=>s+(Number(r.amount_ml)||0),0);


autoTable(doc, {
startY: y+2,
head, body,
theme: 'grid',
styles: { font: 'helvetica', fontSize: 9, cellPadding: 2 },
headStyles: { fillColor: [34,197,94], textColor: 0, halign: 'left' },
columnStyles: { 0:{cellWidth:8,halign:'right'}, 1:{cellWidth:90}, 2:{cellWidth:22,halign:'right'}, 3:{cellWidth:28,halign:'right'}, 4:{cellWidth:32,halign:'right'} },
foot: [['','Totals', totalParts.toFixed(2), `${sumPct.toFixed(2)} %`, `${sumMl.toFixed(2)} ml`]],
footStyles: { fillColor: [18,24,31], textColor: 255 },
margin: { left: margin, right: margin },
didDrawPage: () => {
doc.setFontSize(8); doc.setTextColor(120);
const left = footer?.updatedAtText ? `Updated: ${footer.updatedAtText}` : '';
const right = footer?.userEmail ? `User: ${footer.userEmail}` : '';
doc.text(left, margin, pageH-8); doc.text(right, pageW-margin, pageH-8, { align: 'right' });
}
});


doc.save(`${title || 'recipe'}.pdf`);
}