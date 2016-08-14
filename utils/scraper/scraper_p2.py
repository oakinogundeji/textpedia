import argparse
import sys
import requests as req
from bs4 import BeautifulSoup as BSoup


def scrape(k_words):
    print 'input =', k_words
    baseURL = 'https://en.wikipedia.org/wiki/'
    targetURL = baseURL + k_words[0]
    print 'targetURL', targetURL
    try:
        print 'attempting to hit wikipedia'
        html = req.get(targetURL)
    except ConnectionError as err:
        print 'Error making network connection'
        print err
    except:
        print 'Network connection error'
    else:
        print 'successfully retrieved data from wikipedia'
        bsObj = BSoup(html.text, 'html.parser')
        toc = bsObj.find('div', id='toc')
        p_list = toc.find_previous_siblings('p')
        p_list.reverse()
        print 'num paras = ', len(p_list)
        for para in p_list:
            if len(para) == 0:
                continue
            else:
                print 'para content:'
                print 'para length:', len(para)
                print para.get_text(), '\n'


def Main():
    parser = argparse.ArgumentParser(description="Webscraping Module")
    parser.add_argument('k_words', type=str, nargs='+')
    args = parser.parse_args()
    result = scrape(args.k_words)
    print 'result =', result
    #sys.stdout.flush()


if __name__ == '__main__':
    Main()
