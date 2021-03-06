from PIL import Image
import requests
from io import BytesIO
import numpy as np
import pandas as pd
import webcolors as wc
from bs4 import BeautifulSoup
import json

def get_codes():
    # Funcion para generar df de nombres y codigos alpha2 de los paises
    # La funcion va a la pagina de Wikipedia y lee la tabla y lo guarda todo
    # en un df
    url = "https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2"
    r = requests.get(url)
    soup = BeautifulSoup(r.content)
    tabla = soup.find('table',{'class':'wikitable sortable'})
    filas_tabla = tabla.find_all('tr')

    codigos = []
    nombres = []
    for tr in filas_tabla:
        try:
            td = tr.find_all('td')
            row = [tr.text for tr in td]
            codigo = row[0]
            nombre = row[1]
            codigos.append(codigo)
            nombres.append(nombre)
        except:
            pass

    codes_df = pd.DataFrame({"codigo":codigos, "nombre":nombres})
    return codes_df

def closest_colour(requested_colour):
    # Se utilizó el codigo en este link para categorizar los colores por nombre:
    # https://stackoverflow.com/questions/9694165/convert-rgb-color-to-english-color-name-like-green-with-python
    # Funciona utilizando la distancia euclidiana entre el color que se tiene y los colores de css.
    # Calcula entonces estas distancias y la menor distancia es la que escoge.
    min_colours = {}
    for key, name in wc.css3_hex_to_names.items():
        r_c, g_c, b_c = wc.hex_to_rgb(key)
        rd = (r_c - requested_colour[0]) ** 2
        gd = (g_c - requested_colour[1]) ** 2
        bd = (b_c - requested_colour[2]) ** 2
        min_colours[(rd + gd + bd)] = name
    return min_colours[min(min_colours.keys())]

def get_colour_name(requested_colour):
    try:
        closest_name = actual_name = wc.rgb_to_name(requested_colour)
    except ValueError:
        closest_name = closest_colour(requested_colour)
        actual_name = None
    return actual_name, closest_name

def get_flags():
    #https://countryflags.io/
    df_codes = get_codes() # genero el df de codigos alpha2
    codes = list(df_codes.codigo)
    df_flags = pd.DataFrame(columns=["color", "aux_delete"])
    for code in codes:
        # Para cada uno de los codigos:
        # llamo la api y leo los pixeles de el pais actual y creo un dataframe con R, G, B, a
        url = "https://www.countryflags.io/" + code + "/flat/64.png"
        response = requests.get(url)
        img = Image.open(BytesIO(response.content))
        img_np =np.array(img)
        a = img_np.reshape((4096, 4))
        df = pd.DataFrame(a)
        df.columns = ["R" ,"G", "B", "a"]
        df = df.astype(int)
        df = df[df.a != 0]
        # Aqui agrupo para tener unicamente cuantos pixeles de cada color se tienen
        df = df.groupby(df.columns.tolist()).size().reset_index().rename(columns={0:code})
        # Se llama la funcion get_colour_name para darle un nombre o categorizar cada color
        df['color'] = df.apply(lambda row: get_colour_name((row.R, row.G, row.B))[1], axis=1)

        df = df.loc[:,[code, "color"]]
        df = df.groupby("color").sum()
        df = df.reset_index()
        # Hago un merge para armar el dataframe con todos los paises
        df_flags = df_flags.merge(df, how='outer', left_on='color', right_on='color')
        print(code, end =" ")

    df_flags = df_flags.drop(["aux_delete"], axis=1)  
    df_flags = df_flags.fillna(0)

    colores = list(df_flags.color)
    r = []
    g = []
    b = []
    for color in colores:
        rgb = wc.name_to_rgb(color)
        r.append(rgb[0])
        g.append(rgb[1])
        b.append(rgb[2])

    df_flags["r"] = r
    df_flags["g"] = g
    df_flags["b"] = b
    df_flags["sum_unique"] = df_flags.drop(["color"], axis=1).astype(bool).sum(axis=1)
    df_flags['sum_pixels'] = df_flags.drop(["color", "sum_unique"], axis=1).sum(axis=1)
    total_of_pixels = df_flags.drop(["color", "r", "g", "b", "sum_pixels", "sum_unique"], axis=1).sum().sum()
    df_flags["percentage of pixels"] = 100 * df_flags["sum_pixels"] / total_of_pixels
    df_flags = df_flags.drop("UM", axis=1)
    return df_flags

def get_avg(df_flags):
    # Esta funcion me genera un dataframe con los colores promedio de las banderas de cada pais (en alpha3) y 
    # otro df con los nombres alhpa2 y nombres de los paises
    df_rgb = df_flags.loc[:,["r", "g", "b"]].copy()
    df_flags = df_flags.drop(["sum_unique", "r", "g", "b", "sum_pixels", "percentage of pixels"], axis=1).copy()
    df_flags = df_flags.set_index("color")
    df_avg = pd.DataFrame(columns=["country", "r", "g", "b"])
    for column in df_flags:
        # Para cada pais multiplico el valor de rojo, verde y azul por el numero de pixeles que tiene
        # Luego divido estos valores por el numero de pixeles total y asi obtengo el promedio
        df = df_rgb.copy()
        df["color"] = df_flags[column].values
        df["r_sum"] = df["color"] * df["r"]
        df["g_sum"] = df["color"] * df["g"]
        df["b_sum"] = df["color"] * df["b"]
        df_aux = pd.Series()
        df_aux["country"] = df_flags[column].name
        df_aux["r"] = df.sum()["r_sum"]/2400  # numero de pixeles de las imagenes
        df_aux["g"] = df.sum()["g_sum"]/2400
        df_aux["b"] = df.sum()["b_sum"]/2400
        df_avg = df_avg.append(df_aux, ignore_index=True)
    df_avg = df_avg.set_index("country") # para el json

    # Aqui organizo el df para que queden los promedios con los codigos y nombres de los paises
    df_country_info = pd.read_csv("countries_codes_and_coordinates.csv")
    df_country_info = df_country_info.replace(['"'], [''], regex=True)
    df_country_info.loc[:,["Alpha-2 code","Alpha-3 code"]] =  df_country_info.loc[:,["Alpha-2 code","Alpha-3 code"]].replace([' '], [''], regex=True)
    cols = df_country_info.columns.drop(["Country","Alpha-2 code","Alpha-3 code"])
    df_country_info[cols] = df_country_info[cols].apply(pd.to_numeric, errors='coerce')
    df_country_info = df_country_info.set_index("Alpha-2 code")

    df_name_alpha2 = df_country_info.loc[:,"Country"].copy()


    # tiene tambien latitud y longitud por lo que se necesite
    df_country_info = df_country_info.merge(df_avg, how='inner', left_index=True, right_index=True)

    df_avg_alpha3 = df_country_info.loc[:,["Alpha-3 code", "r", "g", "b"]].copy()
    df_avg_alpha3 = df_avg_alpha3.set_index("Alpha-3 code")
    df_avg_alpha3["value"] = "rgb(" + df_avg_alpha3['r'].astype(str) + "," + df_avg_alpha3['g'].astype(str) + "," + df_avg_alpha3['b'].astype(str) + ")"
    df_avg_alpha3 = df_avg_alpha3.drop(["r", "g", "b"], axis=1)

    

    return df_avg_alpha3, df_name_alpha2
