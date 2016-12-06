import csv
import urllib2
import time
import json
with open("state_city_bk_reduced.csv", 'r') as csvinput:
    with open("state_city_output_bk_r.csv", 'w') as csvoutput:
		writer = csv.writer(csvoutput, lineterminator='\n')
		reader = csv.reader(csvinput, delimiter=',')
		outArray=[]

		v=open("state_city_bk_reduced.csv")
		r=csv.reader(v)
		row = r.next()
		row.append('lat')
		row.append('lng')
		print row

		for row in r:
			time.sleep(2)
			address=str(row[0]+", "+row[1])
			address=address.replace(" ","+")
			print "City, State"+ address
			url="https://maps.googleapis.com/maps/api/geocode/json?address=%s" % (address)
			try: 
				response = urllib2.urlopen(url)
				jsongeocode = json.load(response)
				print "latitude: \t"+ str(jsongeocode['results'][0]['geometry']['location']['lat'])
				print "longitude: \t"+ str(jsongeocode['results'][0]['geometry']['location']['lng'])
				row.append(jsongeocode['results'][0]['geometry']['location']['lat'])
				row.append(jsongeocode['results'][0]['geometry']['location']['lng'])
				
				outArray.append(row)
			except:
				try:
					print jsongeocode
				except:
					print "error occured"

		writer.writerows(outArray)



