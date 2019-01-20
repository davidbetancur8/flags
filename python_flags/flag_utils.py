from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw 

def add_text(img, text):
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype("Coda-Heavy.ttf", 12)# draw.text((x, y),"Sample Text",(r,g,b))
    draw.text((20, 48),text,(0,0,0, 255),font=font)
    return img

