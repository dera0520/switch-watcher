const CronJob = require('cron').CronJob;
const Chromy = require('chromy');
const opn = require('opn');
const request = require('request');

const shops = {
  nintendo: {
    url: 'https://store.nintendo.co.jp/customize.html',
    name: 'My Nintendo Store',
    checkStore: client => {
      return client.evaluate(() => {
        return document.querySelector('#HAC_S_KAYAA p.stock').innerText !== 'SOLD OUT';
      });
    }
  },
  amazon: {
    url: 'http://amzn.asia/79RsjhF',
    name: 'Amazon',
    checkStore: client => {
      return client.evaluate(() => {
        const dom = document.querySelector('#priceblock_ourprice')
        if (!dom) return false;
        const rawPrice = dom.innerText;
        const price = Number(
          rawPrice
            .substr(1)
            .replace(',', '')
            .trim()
        );
        return price < 35000;
      });
    }
  },
  yamada: {
    splatoon: {
      url: 'http://www.yamada-denkiweb.com/1178028018',
      name: 'ヤマダ電機:スプラトゥーン2セット',
      checkStore: client => {
        return client.evaluate(() => {
          const dom = document.querySelector('p.note')
          if (!dom) return false;
          return dom.innerText !== '好評につき売り切れました';
        });
      }
    },
    color: {
      url: 'http://www.yamada-denkiweb.com/1177992013',
      name: 'ヤマダ電機:Joy-Con(L)　ネオンブルー/(R)　ネオンレッド',
      checkStore: client => {
        return client.evaluate(() => {
          const dom = document.querySelector('p.note')
          if (!dom) return false;
          return dom.innerText !== '好評につき売り切れました';
        });
      }
    },
    gray: {
      url: 'http://www.yamada-denkiweb.com/1177991016',
      name: 'ヤマダ電機:Joy-Con(L)/(R)　グレー',
      checkStore: client => {
        return client.evaluate(() => {
          const dom = document.querySelector('p.note')
          if (!dom) return false;
          return dom.innerText !== '好評につき売り切れました';
        });
      }
    }
  },
  yodobashi: {
    splatoon: {
      url: 'http://www.yodobashi.com/product/100000001003570628/',
      name: 'ヨドバシカメラ:スプラトゥーン2セット',
      checkStore: client => {
        return client.evaluate(() => {
          return !['予定数の販売を終了しました', '予約受付を終了しました'].includes(document.querySelector('#js_buyBoxMain p').innerText);
        });
      }
    },
    monster: {
      url: 'http://www.yodobashi.com/product/100000001003583883/',
      name: 'ヨドバシカメラ:モンスターハンターダブルクロス Nintendo Switch Ver. スペシャルパック',
      checkStore: client => {
        return client.evaluate(() => {
          return !['予定数の販売を終了しました', '予約受付を終了しました'].includes(document.querySelector('#js_buyBoxMain p').innerText);
        });
      }
    },
    color: {
      url: 'http://www.yodobashi.com/product/100000001003431566/',
      name: 'ヨドバシカメラ:Joy-Con(L)ネオンブルー/(R)ネオンレッド',
      checkStore: client => {
        return client.evaluate(() => {
          return !['予定数の販売を終了しました', '予約受付を終了しました'].includes(document.querySelector('#js_buyBoxMain p').innerText);
        });
      }
    },
    gray: {
      url: 'http://www.yodobashi.com/product/100000001003431565/',
      name: 'ヨドバシカメラ:Joy-Con(L)/(R)グレー',
      checkStore: client => {
        return client.evaluate(() => {
          return !['予定数の販売を終了しました', '予約受付を終了しました'].includes(document.querySelector('#js_buyBoxMain p').innerText);
        });
      }
    }
  },
  nojima: {
    splatoon: {
      url: 'https://online.nojima.co.jp/Nintendo-HAC-S-KACEA-ESET-%E3%80%90Switch%E3%80%91-%E3%83%8B%E3%83%B3%E3%83%86%E3%83%B3%E3%83%89%E3%83%BC%E3%82%B9%E3%82%A4%E3%83%83%E3%83%81%E6%9C%AC%E4%BD%93-%E3%82%B9%E3%83%97%E3%83%A9%E3%83%88%E3%82%A5%E3%83%BC%E3%83%B32%E3%82%BB%E3%83%83%E3%83%88%EF%BC%885%E5%B9%B4%E4%BF%9D%E8%A8%BC%E3%82%BB%E3%83%83%E3%83%88%EF%BC%89/2810000040986/1/cd/',
      name: 'ノジマオンライン:スプラトゥーン2セット（5年保証セット）',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('.hassoumeyasu2 strong span').innerText !== '完売御礼';
        });
      }
    },
    monster: {
      url: 'https://online.nojima.co.jp/CAPCOM-HAC-S-KCAEB-ESET-%E3%80%90Switch%E3%80%91-%E3%83%A2%E3%83%B3%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%8F%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%80%E3%83%96%E3%83%AB%E3%82%AF%E3%83%AD%E3%82%B9-Nintendo-Switch-Ver--%E3%82%B9%E3%83%9A%E3%82%B7%E3%83%A3%E3%83%AB%E3%83%91%E3%83%83%E3%82%AF%EF%BC%885%E5%B9%B4%E4%BF%9D%E8%A8%BC%E3%82%BB%E3%83%83%E3%83%88%EF%BC%89/2810000041433/1/cd/',
      name: 'ノジマオンライン:モンスターハンターダブルクロス Nintendo Switch Ver. スペシャルパック（5年保証セット）',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('.hassoumeyasu2 strong span').innerText !== '完売御礼';
        });
      }
    },
    color: {
      url: 'https://online.nojima.co.jp/Nintendo-HAC-S-KABAA-ESET-%E3%80%90Switch%E3%80%91-%E3%83%8B%E3%83%B3%E3%83%86%E3%83%B3%E3%83%89%E3%83%BC%E3%82%B9%E3%82%A4%E3%83%83%E3%83%81%E6%9C%AC%E4%BD%93-Joy-Con%28L%29-%E3%83%8D%E3%82%AA%E3%83%B3%E3%83%96%E3%83%AB%E3%83%BC-%28R%29-%E3%83%8D%E3%82%AA%E3%83%B3%E3%83%AC%E3%83%83%E3%83%89%EF%BC%885%E5%B9%B4%E4%BF%9D%E8%A8%BC%E3%82%BB%E3%83%83%E3%83%88%EF%BC%89-/2810000036439/1/cd/',
      name: 'ノジマオンライン:Joy-Con(L) ネオンブルー/(R) ネオンレッド（5年保証セット）',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('.hassoumeyasu2 strong span').innerText !== '完売御礼';
        });
      }
    },
    color2: {
      url: 'https://online.nojima.co.jp/Nintendo-HAC-S-KABAA-%E3%80%90Switch%E3%80%91-%E3%83%8B%E3%83%B3%E3%83%86%E3%83%B3%E3%83%89%E3%83%BC%E3%82%B9%E3%82%A4%E3%83%83%E3%83%81%E6%9C%AC%E4%BD%93-Joy-Con%28L%29-%E3%83%8D%E3%82%AA%E3%83%B3%E3%83%96%E3%83%AB%E3%83%BC-%28R%29-%E3%83%8D%E3%82%AA%E3%83%B3%E3%83%AC%E3%83%83%E3%83%89/4902370535716/1/cd/',
      name: 'ノジマオンライン:Joy-Con(L) ネオンブルー/(R) ネオンレッド',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('.hassoumeyasu2 strong span').innerText !== '完売御礼';
        });
      }
    },
    gray: {
      url: 'https://online.nojima.co.jp/Nintendo-HAC-S-KAAAA-ESET-%E3%80%90Switch%E3%80%91-%E3%83%8B%E3%83%B3%E3%83%86%E3%83%B3%E3%83%89%E3%83%BC%E3%82%B9%E3%82%A4%E3%83%83%E3%83%81%E6%9C%AC%E4%BD%93-Joy-Con%28L%29-%28R%29-%E3%82%B0%E3%83%AC%E3%83%BC%EF%BC%885%E5%B9%B4%E4%BF%9D%E8%A8%BC%E3%82%BB%E3%83%83%E3%83%88%EF%BC%89-/2810000036422/1/cd/',
      name: 'ノジマオンライン:Joy-Con(L)/(R) グレー（5年保証セット）',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('.hassoumeyasu2 strong span').innerText !== '完売御礼';
        });
      }
    },
    gray2: {
      url: 'https://online.nojima.co.jp/Nintendo-HAC-S-KAAAA-%E3%80%90Switch%E3%80%91-%E3%83%8B%E3%83%B3%E3%83%86%E3%83%B3%E3%83%89%E3%83%BC%E3%82%B9%E3%82%A4%E3%83%83%E3%83%81%E6%9C%AC%E4%BD%93-Joy-Con%28L%29-%28R%29-%E3%82%B0%E3%83%AC%E3%83%BC/4902370535709/1/cd/',
      name: 'ノジマオンライン:Joy-Con(L)/(R) グレー',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('.hassoumeyasu2 strong span').innerText !== '完売御礼';
        });
      }
    }
  },
  seven: {
    gray: {
        url: 'http://7net.omni7.jp/detail/2110595636',
        name: 'セブンネットショッピング:グレイ',
        checkStore: client => {
          return client.evaluate(() => {
            return document.querySelector('.btnStrongest input').getAttribute('title') !== '在庫切れ';
          });
        }
    },
    color: {
        url: 'http://7net.omni7.jp/detail/2110595637',
        name: 'セブンネットショッピング:Joy-Con(L)　ネオンブルー/(R)　ネオンレッド',
        checkStore: client => {
          return client.evaluate(() => {
            return document.querySelector('.btnStrongest input').getAttribute('title') !== '在庫切れ';
          });
        }
    }
  },
  yokado: {
    splatoon: {
        url: 'http://iyec.omni7.jp/detail/4902370537338',
        name: 'ヨーカドーネットショップ:スプラトゥーンセット',
        checkStore: client => {
          return client.evaluate(() => {
            console.log(document.querySelector('.btnStrongest input').getAttribute('title'));
            return document.querySelector('.btnStrongest input').getAttribute('title') !== 'SOLD OUT';
          });
        }
    },
    gray: {
        url: 'http://iyec.omni7.jp/detail/4902370535709',
        name: 'ヨーカドーネットショップ:グレイ',
        checkStore: client => {
          return client.evaluate(() => {
            console.log(document.querySelector('.btnStrongest input').getAttribute('title'));
            return document.querySelector('.btnStrongest input').getAttribute('title') !== '在庫切れ';
          });
        }
    },
    color: {
        url: 'http://iyec.omni7.jp/detail/4902370535716',
        name: 'ヨーカドーネットショップ:Joy-Con(L)　ネオンブルー/(R)　ネオンレッド',
        checkStore: client => {
          return client.evaluate(() => {
            console.log(document.querySelector('.btnStrongest input').getAttribute('title'));
            return document.querySelector('.btnStrongest input').getAttribute('title') !== '在庫切れ';
          });
        }
    }
  },
  rakuten: {
    onetwo: {
      url: 'http://books.rakuten.co.jp/rb/14779141/',
      name: 'rakutenブックス:Joy-Con(L) ネオンブルー/(R) ネオンレッド + 1-2-Switch',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('span.status').innerText.trim() !== 'ご注文できない商品*';
        });
      }
    },
    marica: {
      url: 'http://books.rakuten.co.jp/rb/14785337/',
      name: 'rakutenブックス:Joy-Con(L)/(R) グレー + マリオカート8 デラックス',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('span.status').innerText.trim() !== 'ご注文できない商品*';
        });
      }
    },
    zelda: {
      url: 'http://books.rakuten.co.jp/rb/14779136/',
      name: 'rakutenブックス:Joy-Con(L)/(R) グレー + ゼルダの伝説　ブレス オブ ザ ワイルド',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('span.status').innerText.trim() !== 'ご注文できない商品*';
        });
      }
    },
    splatoon: {
      url: 'http://books.rakuten.co.jp/rb/14943334/',
      name: 'rakutenブックス:スプラトゥーン2セット',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('span.status').innerText.trim() !== 'ご注文できない商品*';
        });
      }
    },
    color: {
      url: 'http://books.rakuten.co.jp/rb/14655635/',
      name: 'rakutenブックス:Joy-Con(L) ネオンブルー/(R) ネオンレッド 【楽天あんしん延長保証（自然故障＋物損プラン）セット】',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('span.status').innerText.trim() !== 'ご注文できない商品*';
        });
      }
    },
    color2: {
      url: 'http://books.rakuten.co.jp/rb/14647222/',
      name: 'rakutenブックス:Joy-Con(L) ネオンブルー/(R) ネオンレッド',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('span.status').innerText.trim() !== 'ご注文できない商品*';
        });
      }
    },
    gray: {
      url: 'http://books.rakuten.co.jp/rb/14655634/',
      name: 'rakutenブックス:Joy-Con(L)/(R) グレー 【楽天あんしん延長保証（自然故障＋物損プラン）セット】',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('span.status').innerText.trim() !== 'ご注文できない商品*';
        });
      }
    },
    gray2: {
      url: 'http://books.rakuten.co.jp/rb/14647221/',
      name: 'rakutenブックス:Joy-Con(L)/(R) グレー',
      checkStore: client => {
        return client.evaluate(() => {
          return document.querySelector('span.status').innerText.trim() !== 'ご注文できない商品*';
        });
      }
    }
  },
  tsutaya: {
    url: 'http://shop.tsutaya.co.jp/game/product/4902370535716/',
    name: 'TSUTAYA',
    checkStore: client => {
      return client.evaluate(() => {
        return document.querySelector('li.tolBtn img').getAttribute('alt') !== '在庫なし';
      });
    }
  }
};

function zeroPadding(num, length) {
  return ('0000000000' + num).slice(-length);
}

function logger(msg) {
  const now = new Date();
  console.log(zeroPadding(now.getHours(), 2) + ':' + zeroPadding(now.getMinutes(), 2) + ' > ' + msg);
}

function sendToSlack(options){
    var message = "在庫が復活したページを見つけたよ！\n"+ options.name + "\n" + options.url;
    var request_data = {
        url: 'https://hooks.slack.com/services/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        form: `payload={"text": "${message}", "username": "switch-watcher","icon_emoji": ":angel:"}`,
        json :true
    };

    request.post(request_data, function(error, response, body){
      if (!error && response.statusCode == 200) {
        console.log(body.name);
      } else {
        console.log('error: '+ response.statusCode + body);
      }
    });
}

async function check(client, options) {
  try {
    await client.goto(options.url);
    const result = await options.checkStore(client);
    if (result) {
      logger(`[${options.name}] \u001b[31mNow is the Time!!!\u001b[0m`);
      opn(options.url);
      sendToSlack(options);
    } else {
      logger(`[${options.name}] \u001b[34mNow is Not the Time...\u001b[0m`);
    }
  } catch(e) {
    // logger(e);
  }
}

async function main () {
  let chromy = new Chromy();
  await check(chromy, shops.nintendo);
  await check(chromy, shops.amazon);
  await check(chromy, shops.yamada.splatoon);
  await check(chromy, shops.yamada.color);
  await check(chromy, shops.yamada.gray);
  await check(chromy, shops.yodobashi.splatoon);
  // await check(chromy, shops.yodobashi.monster);
  await check(chromy, shops.yodobashi.color);
  await check(chromy, shops.yodobashi.gray);
  await check(chromy, shops.nojima.splatoon);
  // await check(chromy, shops.nojima.monster);
  await check(chromy, shops.nojima.color);
  await check(chromy, shops.nojima.color2);
  await check(chromy, shops.nojima.gray);
  await check(chromy, shops.nojima.gray2);
  await check(chromy, shops.seven.gray);
  await check(chromy, shops.seven.color);
  await check(chromy, shops.yokado.splatoon);
  await check(chromy, shops.yokado.gray);
  await check(chromy, shops.yokado.color);
  await check(chromy, shops.rakuten.onetwo);
  // await check(chromy, shops.rakuten.marica);
  // await check(chromy, shops.rakuten.zelda);
  await check(chromy, shops.rakuten.splatoon);
  await check(chromy, shops.rakuten.color);
  await check(chromy, shops.rakuten.color2);
  await check(chromy, shops.rakuten.gray);
  await check(chromy, shops.rakuten.gray2);
  await check(chromy, shops.tsutaya);
  await chromy.close();
}

logger('Start Switch Watcher');
new CronJob('* */2 * * * *', main).start();
