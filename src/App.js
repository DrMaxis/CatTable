import {createClient} from 'urql';
import axios from 'axios';
import React from 'react';
import moment from 'moment'
import DataTable from '../src/components/DataTableBase';
import DataTableExtensions from 'react-data-table-component-extensions';
import 'react-data-table-component-extensions/dist/index.css';

const _ = require('lodash');
const waifus = require('../src/utils/girls');
const APIURL = "https://api.thegraph.com/subgraphs/name/catgirlcoin/catgirl-bsc"

const fetchAllQuery = `
query {
  catgirls(
    orderDirection: desc,
    orderBy: timestamp,
  ) {
    characterId,
    id,
    owner {
      id
    }
    season,
    rarity,
    nyaScore,
    timestamp,
  }
}

`
async function fetchNFTTradeListings() {
    const fetchLimit = 1000;
    //const address = requestOptions.address;

    let queryOptions = `&limit=${fetchLimit}&skip=0&sort=listed_desc`;

    return axios({
        method: 'get',
        url: `https://api.nftrade.com/api/v1/tokens?contracts[]=d6989ada-8bc6-416c-87be-dc84de7710fb&chains[]=56` + queryOptions,
    })
        .then(function (response) {
            return response
        });

}
function determineWaifu(characterId, rarity) {

    let waifu = waifus.girls.filter(function (cat) {
        return cat.rarity === rarity && cat.characterId === characterId;
    });

    return {
        name: waifu[0]['name'],
        avi: waifu[0]['avi']
    }
}
async function fetchLatestListings() {
    let waifus = [];
    let listings = await fetchNFTTradeListings();


    _.forEach(listings.data, async function (listing) {
        let waifu =  await getCatGirlInfo(listing);
        return waifus.push( {
            season: waifu.season,
            avi: waifu.avi,
            name: waifu.name,
            nyaScore: waifu.nyaScore,
            rarity: waifu.rarity,
            owner: waifu.owner,
            list_time: waifu.list_time,
            highest_offer: waifu.highest_offer,
            last_sell: waifu.last_sell,
            last_sell_time: waifu.last_sell_time,
            mintTime: moment.unix(waifu.mintTime).format('dddd, MMMM Do, YYYY h:mm:ss A'),
            price: waifu.price,
            last_updated: waifu.last_updated,
            verified: waifu.verified,
        })

    });

    return waifus
}
async function fetchCatGirlNFT(tokenID) {
    const APIURL = "https://api.thegraph.com/subgraphs/name/catgirlcoin/catgirl-bsc"
    const client = createClient({url: APIURL});
    const fetchCatGirlQuery = `
    query {
      catgirls(
        orderDirection: desc,
        orderBy: timestamp,
        where: {id:"0x${parseInt(tokenID).toString(16)}"},
      ) {
        characterId,
        id,
        owner {
          id
        }
        season,
        rarity,
        nyaScore,
        timestamp,

      }
    }
    `
    return await client.query(fetchCatGirlQuery).toPromise();
}
async function getCatGirlInfo(listing) {

    let rawCat = {
        nftTradeId: listing.id,
        contractId: listing.contractId,
        list_time: listing.listedAt,
        highest_offer: listing.highest_offer,
        last_sell: listing.last_sell,
        last_sell_time: listing.last_sell_at,
        mintTime: listing.mintTime,
        price: listing.price,
        tokenID: listing.tokenID,
        last_updated: listing.updatedAt,
        verified: listing.contract.verified,
    }

    let nftResponse = await fetchCatGirlNFT(rawCat.tokenID);
    let NFT = nftResponse.data.catgirls[0];
    let waifu = determineWaifu(NFT.characterId, NFT.rarity);

    return {
        season: NFT.season,
        avi: waifu.avi,
        name: waifu.name,
        characterId: NFT.characterId,
        nyaScore: NFT.nyaScore,
        rarity: NFT.rarity,
        owner: NFT.owner.id,
        nftTradeId: rawCat.id,
        contractId: rawCat.contractId,
        list_time: rawCat.list_time,
        highest_offer: rawCat.highest_offer,
        last_sell: rawCat.last_sell,
        last_sell_time: rawCat.last_sell_time,
        mintTime: NFT.timestamp,
        price: rawCat.price,
        tokenID: rawCat.tokenID,
        last_updated: rawCat.last_updated,
        verified: rawCat.verified,
    }
}

const columns = [
    {
        name: 'Season',
        selector: row => row.season,
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Avi',
        selector: row => row.avi,
        sortable: true,
        right: true,
        reorder: true,
        cell: row => <img height="84px" width="56px" alt={'Nyaa'} src={row.avi} />
    },
    {
        name: 'Name',
        selector: row => row.name ?? 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Nya Score',
        selector: row => row.nyaScore ?? 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Rarity',
        selector: row => row.rarity ?? 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Born',
        selector: row => row.mintTime ?? 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'List Price',
        selector: row => row.price ?? 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Listed',
        selector: row => row.list_time ?? 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'highest Offer',
        selector: row => row.highest_offer ?? 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Sell Price',
        selector: row => row.last_sell ??'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Sold at',
        selector: row => row.last_sell_time ?? 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Last Updated',
        selector: row => row.last_updated ?? 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },

];




class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {}
        };
    }


     componentWillMount() {
        let promise = new Promise((resolve, reject)=> {
            let data =  fetchLatestListings();
            if(data) {
                resolve(data);
            } else {
                reject(Error('error'));
            }

        })


        promise.then(result => {
            setTimeout(() => {
                this.setState({data: result});
        }, 500)

        }, function (error) {
            this.setState({data:error});
        })
    }



    render() {

        let data = this.state.data;
        let tableData = {columns, data}
        return data.length ?
            <DataTableExtensions {...tableData} >
                <DataTable
                    title="Most Recent CatGirl Listings"
                    pagination
                    print={false}
                    export={false}
                    highlightOnHover
                    filter
                />
            </DataTableExtensions>
             :(

            <span> loading</span>
        );

    }
}
export default App;
