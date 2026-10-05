import json
import urllib.request

url = "https://atmatooytieelwiarffp.supabase.co/rest/v1/vocabularies?select=id,word,meaning_th,meaning_en,part_of_speech&word=eq.about"
headers = {
    "apikey": "sb_publishable_ijcWQyHGOSuCilaFvt1r0w_JbH6YafO",
    "Authorization": "Bearer sb_publishable_ijcWQyHGOSuCilaFvt1r0w_JbH6YafO"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("Supabase returned:", data)
except Exception as e:
    print("Supabase error:", e)
