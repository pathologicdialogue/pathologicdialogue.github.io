import re
import pandas as pd
import os
import numpy as np
pd.options.mode.chained_assignment = None
a='GOG Games/Pathologic Classic HD/data/Scripts/'
#a='./'
arr = os.listdir(a)

#arr=['world_klara.bin']

text=pd.read_csv('pathologic_hex.csv',quotechar='"',skipinitialspace=True)
text_en=pd.read_csv('pathologic_en.csv',quotechar='"',skipinitialspace=True)
text_ru=pd.read_csv('pathologic_ru.csv',quotechar='"',skipinitialspace=True)

pattern1=b'\x27\x00\x03\x00'
regex1 = re.compile(pattern1)
l=-1
for x in arr:
    print(x)
    f = open(a+x, 'rb')
    data = (f.read())
    f.close()
    df=pd.DataFrame(data={'id':[500071],'offset':[0],'hex':[""],'person':[''],'bit':[0],'bit1':[''],'text_en':[""],'text_ru':[""]})
    for i in range(len(text['id'])):
        bit=l
        
        pattern=text['hex'][i].encode('utf-8')
        regex = re.compile(pattern)
        for match_obj in regex.finditer(data):
            offset = match_obj.start()
            if data[match_obj.end():match_obj.end()+1]==b'\x12':
                if data[match_obj.end()+2:match_obj.end()+6]==b'\xff\xff\xff\xff':
                	df=df.append(pd.DataFrame(data={'id':[text['id'][i]],'offset':[offset],'hex':[text['hex'][i]],'person':['Player'],'bit':[''],'bit1':[''],'text_en':[text_en['entext'][i]],'text_ru':[text_ru['rutext'][i]]}))
                else:
                	df=df.append(pd.DataFrame(data={'id':[text['id'][i]],'offset':[offset],'hex':[text['hex'][i]],'person':['Player'],'bit':[int.from_bytes(data[match_obj.end()+2:match_obj.end()+6], "little")],'bit1':[''],'text_en':[text_en['entext'][i]],'text_ru':[text_ru['rutext'][i]]}))
            elif data[match_obj.end():match_obj.end()+1]==b'\x55':
                #if int.from_bytes(data[match_obj.start()-59:match_obj.start()-55], "little")==131072:
                #    df=df.append(pd.DataFrame(data={'id':[text['id'][i]],'offset':[offset],'hex':[text['hex'][i]],'person':['Character'],'bit':[int.from_bytes(data[match_obj.start()-99:match_obj.start()-95], "little")],'bit1':[int.from_bytes(data[match_obj.start()-99:match_obj.start()-95], "little")],'text_en':[text_en['entext'][i]],'text_ru':[text_ru['rutext'][i]]}))
                #else:
                data1=data[match_obj.start()-100:match_obj.start()]
                for match_obj1 in regex1.finditer(data1):
                    bit=int.from_bytes(data1[match_obj1.start()-4:match_obj1.start()], "little")
                l=l-1
                df=df.append(pd.DataFrame(data={'id':[text['id'][i]],'offset':[offset],'hex':[text['hex'][i]],'person':['Character'],'bit':[bit],'bit1':[bit],'text_en':[text_en['entext'][i]],'text_ru':[text_ru['rutext'][i]]}))
            elif data[match_obj.end():match_obj.end()+1]==b'\x50':
                df=df.append(pd.DataFrame(data={'id':[text['id'][i]],'offset':[offset],'hex':[text['hex'][i]],'person':['Name'],'bit':[''],'bit1':[''],'text_en':[text_en['entext'][i]],'text_ru':[text_ru['rutext'][i]]}))
            elif data[match_obj.start()-2:match_obj.start()]==b'\x12\x00':
                df=df.append(pd.DataFrame(data={'id':[text['id'][i]],'offset':[offset],'hex':[text['hex'][i]],'person':['Quest'],'bit':[int.from_bytes(data[match_obj.end():match_obj.end()+4], "little")],'bit1':[''],'text_en':[text_en['entext'][i]],'text_ru':[text_ru['rutext'][i]]}))
            elif (data[match_obj.start()-4:match_obj.start()]==b'\x03\x00\x00\x00') & (data[match_obj.end():match_obj.end()+4]==b'\x02\x00\x02\x00'):
                df=df.append(pd.DataFrame(data={'id':[text['id'][i]],'offset':[offset],'hex':[text['hex'][i]],'person':['Letter'],'bit':[text['id'][i]],'bit1':[text['id'][i]],'text_en':[text_en['entext'][i]],'text_ru':[text_ru['rutext'][i]]}))
            elif (data[match_obj.start()-14:match_obj.start()-10]==b'\x03\x00\x00\x00') & (data[match_obj.start()-6:match_obj.start()-2]==b'\x02\x00\x02\x00'):
                df=df.append(pd.DataFrame(data={'id':[text['id'][i]],'offset':[offset],'hex':[text['hex'][i]],'person':['Letter'],'bit':[int.from_bytes(data[match_obj.start()-10:match_obj.start()-6], "little")],'bit1':[text['id'][i]],'text_en':[text_en['entext'][i]],'text_ru':[text_ru['rutext'][i]]}))

        
        #pattern='\x12\x00'+text['hex'][i]+'\x55'
        #regex = re.compile(pattern)
        #n=0
        #for match_obj in regex.finditer(data):
        #    offset = match_obj.start()
        #    n=n+1
        #    df=df.append(pd.DataFrame(data={'id':[text['id'][i]],'offset':[offset],'hex':[text['hex'][i]],'person':['Character'],'text_en':[text_en['entext'][i]],'text_ru':[text_ru['rutext'][i]]}))
        #pattern='\x12\x00'+text['hex'][i]+'\x12'
        #regex = re.compile(pattern)
        #for match_obj in regex.finditer(data):
        #    offset = match_obj.start()
        #    n=n+1
        #    df=df.append(pd.DataFrame(data={'id':[text['id'][i]],'offset':[offset],'hex':[text['hex'][i]],'person':['Player'],'text_en':[text_en['entext'][i]],'text_ru':[text_ru['rutext'][i]]}))
        #if n==0:
        #	pattern='\x12\x00'+text['hex'][i]
        #	regex = re.compile(pattern)
        #	for match_obj in regex.finditer(data):
        #	    offset = match_obj.start()
        #	    n=n+1
        #	    df=df.append(pd.DataFrame(data={'id':[text['id'][i]],'offset':[offset],'hex':[text['hex'][i]],'person':[''],'text_en':[text_en['entext'][i]],'text_ru':[text_ru['rutext'][i]]}))
        #    
    df=df.sort_values(by=['offset']).reset_index()
    for i in range(len(df['id'])):
        if df['person'][i]=='Character':
            n=df['bit'][i]
        elif df['person'][i]=='Player':
            df['bit1'][i]=n
    
    df=df.drop_duplicates(subset=['id'])
    if len(df)>1:
        df.to_csv(a+x+'.csv')
