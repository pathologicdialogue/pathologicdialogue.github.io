import pandas as pd
import numpy as np
import glob
names=glob.glob('k2*')
names.extend(glob.glob('NPC_Klara*'))
#names=glob.glob('*.csv')
print(names)
#names=['k2system_burah.bin.csv']

for filename in names:
    print(filename)
    data=pd.read_csv(filename)
    
    start=np.where((data['bit']<=0) & (data['person']=='Character'))[0]
    if len(np.where((data['person']=='Name'))[0])>0:
        name=data['text_en'][np.where((data['person']=='Name'))[0][1]]
        name1='Changeling'
        
        f = open("../"+filename.split('.')[0]+'.html', "w")
        
        f.write("""<!DOCTYPE html>
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css">
        <script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
        <script src="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>
        </head>
        <body>
        
        <div data-role="page" id="pageone">
          <div data-role="header">
            <h1>"""+name1+' & '+name+"""</h1>
          </div>
        
          <div data-role="main" class="ui-content">
        """)
        
        
        def loop(a4,n,level):
            for j4 in a4:
                f.write('<div data-role="collapsible">')
                f.write('<h1>'+str(level+1)+'.'+name1+': '+data['text_en'][j4]+'</h1>')
                f.write('<p>'+str(level+1)+'.'+name1+': '+data['text_en'][j4]+'</p>')
                n=n+1
                if np.isfinite(data['bit'][j4]):
                    print(data['bit'][j4])
                    b4=np.where((data['bit1'] == data['bit'][j4]) & (data['person']=='Character'))[0][0]
                    a5=np.where((data['bit1'] == data['bit'][b4]) & (data['person']=='Player'))[0]
                    f.write('<div data-role="collapsible">')
                    f.write('<h1>'+str(level+2)+'.'+name+': '+data['text_en'][b4]+'</h1>')
                    f.write('<p>'+str(level+2)+'.'+name+': '+data['text_en'][b4]+'</p>')
                    n=n+1
                    n=loop(a5,n,level+2)
                    f.write('</div>')
                f.write('</div>')    
            return n
        
        
        n=1
        level=1
        
        for i in start:
            f.write('<div data-role="collapsible">')
            f.write('<h1>'+str(level)+'.'+name+': '+data['text_en'][i]+'</h1>')
            f.write('<p>'+str(level)+'.'+name+': '+data['text_en'][i]+'</p>')
            n=n+1
            a1=np.where((np.array(data['bit1']) == np.int(data['bit'][i])) & (data['person']=='Player'))[0]
            n=loop(a1,n,level)
            #n=getn(a1,n,level)
            f.write('</div>')
            f.write('')
            
        f.write('''  </div>
        
        
        </div> 
        
        </body>
        </html>''')
        
        
for filename in names:
    print(filename)
    data=pd.read_csv(filename)
    start=np.where((data['bit']<=0) & (data['person']=='Character'))[0]
    if len(np.where((data['person']=='Name'))[0])>0:
        name=data['text_ru'][np.where((data['person']=='Name'))[0][1]]
        name1='Самозванка'
        
        f = open("../"+filename.split('.')[0]+'.html', "w")
        
        f.write("""<!DOCTYPE html>
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css">
        <script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
        <script src="https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>
        </head>
        <body>
        
        <div data-role="page" id="pageone">
          <div data-role="header">
            <h1>"""+name1+' & '+name+"""</h1>
          </div>
        
          <div data-role="main" class="ui-content">
        """)
        
        
        def loop(a4,n,level):
            for j4 in a4:
                f.write('<div data-role="collapsible">')
                f.write('<h1>'+str(level+1)+'.'+name1+': '+data['text_ru'][j4]+'</h1>')
                f.write('<p>'+str(level+1)+'.'+name1+': '+data['text_ru'][j4]+'</p>')
                n=n+1
                if np.isfinite(data['bit'][j4]):
                    print(data['bit'][j4])
                    b4=np.where((data['bit1'] == data['bit'][j4]) & (data['person']=='Character'))[0][0]
                    a5=np.where((data['bit1'] == data['bit'][b4]) & (data['person']=='Player'))[0]
                    f.write('<div data-role="collapsible">')
                    f.write('<h1>'+str(level+2)+'.'+name+': '+data['text_ru'][b4]+'</h1>')
                    f.write('<p>'+str(level+2)+'.'+name+': '+data['text_ru'][b4]+'</p>')
                    n=n+1
                    n=loop(a5,n,level+2)
                    f.write('</div>')
                f.write('</div>')    
            return n
        
        
        n=1
        level=1
        
        for i in start:
            f.write('<div data-role="collapsible">')
            f.write('<h1>'+str(level)+'.'+name+': '+data['text_ru'][i]+'</h1>')
            f.write('<p>'+str(level)+'.'+name+': '+data['text_ru'][i]+'</p>')
            n=n+1
            a1=np.where((data['bit1'] == data['bit'][i]) & (data['person']=='Player'))[0]
            n=loop(a1,n,level)
            #n=getn(a1,n,level)
            f.write('</div>')
            f.write('')
            
        f.write('''  </div>
        
        
        </div> 
        
        </body>
        </html>''')