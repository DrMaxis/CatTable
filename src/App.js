import {createClient} from 'urql';
import axios from 'axios';
import React from 'react';
import moment from 'moment';
import DataTable from '../src/components/DataTableBase';
import DataTableExtensions from 'react-data-table-component-extensions';
import 'react-data-table-component-extensions/dist/index.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import {Button, Col, FormControl, InputGroup} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import AlchemistBlock from './assets/alchemistblock.gif';


require('dotenv').config();
const Web3 = require('web3');
const waifus = require('../src/utils/girls');
const catgirlanalyticsurl = process.env.REACT_APP_CATGIRL_ANALYTICS_URL;
const catgirlID = process.env.REACT_APP_CATGIRL_NFTTRADE_ID;
const catgirlChainID = process.env.REACT_APP_CATGIRL_NFT_CHAINID;
const nftTradeUrl = process.env.REACT_APP_CATGIRL_NFTTRADE_LISTINGS_URL;
const nftAnalyticsUrl = process.env.REACT_APP_NFT_ACCOUNT_ANALYTICS_URL;
const binanceApiUrl = process.env.REACT_APP_BINANCE_API_URL;

async function getBNBPrice() {
    const url = `${binanceApiUrl}`;
    return axios({
        method: 'get',
        url: url,
    })
        .then(function (response) {
            return response.data.price;
        });
}

async function fetchNFTTradeListings(options) {
    let query;
    const fetchLimit = 100;
    if (options) {
        query = `${nftAnalyticsUrl}${encodeURIComponent(options.address)}&contracts[]=${catgirlID}&connectedChainId[]=${catgirlChainID}&limit=${fetchLimit}&skip=0&sort=listed_desc`;
    } else {
        query = `${nftTradeUrl}&limit=${fetchLimit}&skip=0&sort=listed_desc`;
    }
    return axios({
        method: 'get',
        url: query,
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

async function fetchLatestListings(requestOptions) {
    let listings;
    let waifus = [];

    if (requestOptions.address !== null) {
        listings = await fetchNFTTradeListings(requestOptions);
    } else {
        listings = await fetchNFTTradeListings(false);
    }

    await Promise.all(listings.data.map(async function (listing) {
        let waifu = await getCatGirlInfo(listing, []);
        return waifus.push({
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
            mintTime: waifu.mintTime,
            price: waifu.price,
            last_updated: waifu.last_updated,
            verified: waifu.verified,
            listing: waifu.listing,
        })
    }));

    return waifus;
}

async function fetchCatGirlNFT(tokenID) {
    const client = createClient({url: catgirlanalyticsurl});
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


async function getCatGirlInfo(listing, rawNFT) {
    let rawCat, nftResponse, NFT, waifu;
    if (listing !== false) {
        rawCat = {
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
        nftResponse = await fetchCatGirlNFT(rawCat.tokenID);
        NFT = await nftResponse.data.catgirls[0];
        waifu = determineWaifu(NFT.characterId, NFT.rarity);
    }

    if (rawNFT.length !== 0) {
        nftResponse = await rawNFT;
        NFT = await nftResponse.data.catgirls[0];
        rawCat = {
            nftTradeId: listing.id ?? null,
            contractId: listing.contractId ?? null,
            list_time: listing.listedAt ?? null,
            highest_offer: listing.highest_offer ?? null,
            last_sell: listing.last_sell ?? null,
            last_sell_time: listing.last_sell_at ?? null,
            mintTime: listing.mintTime ?? null,
            price: listing.price ?? null,
            tokenID: listing.tokenID ?? NFT.id,
            last_updated: listing.updatedAt ?? null,
            verified: null,
        }
        waifu = determineWaifu(NFT.characterId, NFT.rarity);
    }

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
        listing: `${process.env.REACT_APP_NFTTRADE_LISTING_URL}/${process.env.REACT_APP_CATGIRL_ADDRESS}/${rawCat.tokenID}`
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
        right: true,
        reorder: true,
        cell: row => <img className={"catgirl-avi"} alt={'Nyaa'} src={row.avi}/>
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
        selector: row => row.mintTime != null ? moment.unix(row.mintTime).format('ll') : 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Listing',
        selector: row => row.listing != null ? <a href={row.listing}>Listing</a> : 'N/A',
        right: true,
        reorder: true,
    },
    {
        name: 'Owner',
        selector: row => row.owner ?? 'N/A',
        right: true,
        reorder: true,
    },
    {
        name: 'Price (BNB)',
        selector: row => row.price ?? 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Listed',
        selector: row => row.list_time != null ? moment(row.list_time).format('ll') : 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Highest Offer',
        selector: row => row.highest_offer ?? 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Sold For (BNB)',
        selector: row => row.last_sell ?? 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Sold at',
        selector: row => row.last_sell_time != null ? moment(row.last_sell_time).format('ll') : 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },
    {
        name: 'Last Updated',
        selector: row => row.last_updated != null ? moment(row.last_updated).format('ll') : 'N/A',
        sortable: true,
        right: true,
        reorder: true,
    },

];
const ExpandedComponent = ({data}) => <pre>{JSON.stringify(data, null, 2)}</pre>;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            loading: false,
            name: '',
            searchInput: '',
            timestamp: moment().unix(),
            error: '',
            bnbPrice: ''
        };
        this.handleOnChange = this.handleOnChange.bind(this)
        this.onAddressInput = this.onAddressInput.bind(this)
        this.handleAddressSubmit = this.handleAddressSubmit.bind(this)
        this.validateAddress = this.validateAddress.bind(this);
        this.refreshData = this.refreshData.bind(this);
        this.isLoading = this.isLoading.bind(this);
    }


    handleOnChange({target: {name, value}}) {
        this.setState({[name]: value}, () => {
        })
    }

    componentDidMount() {

        let fetchBNBPrice = new Promise((resolve, reject) => {
            let data = getBNBPrice();
            if (data) {
                resolve(data);
            } else {
                reject(Error('error'));
            }
        })

        fetchBNBPrice.then(result => {
            setTimeout(() => {
                this.setState({bnbPrice: result});
            }, 1500)

        }, function (error) {
            console.log(error);
            this.setState({error: error});
        })

        let fetchTableData = new Promise((resolve, reject) => {
            let data = fetchLatestListings(false);
            if (data) {
                resolve(data);
            } else {
                reject(Error('error'));
            }
        })

        fetchTableData.then(result => {
            setTimeout(() => {
                this.setState({data: result});
            }, 1500)

        }, function (error) {
            console.log(error);
            this.setState({error: error});
        })
    }

    refreshData() {
        let fetchTableData = new Promise((resolve, reject) => {
            let data = fetchLatestListings(false);
            if (data) {
                resolve(data);
            } else {
                reject(Error('error'));
            }
        })

        fetchTableData.then(result => {
            this.setState({loading: true});
            setTimeout(() => {
                this.setState({loading: false});
                this.setState({data: result});
            }, 1500)

        }, function (error) {
            console.log(error);
            this.setState({error: error});
        })
    }
    onAddressInput({target: {name, value}}) {
        this.setState({[name]: value}, () => {
        })
    }

    validateAddress(input) {
        return Web3.utils.isAddress(input);
    }
isLoading() {
        if(this.state.loading === true) {
            return true
        } else return false;
}
    handleAddressSubmit(e) {
        e.preventDefault();

        let isVerifiedAddress = this.validateAddress(this.state.searchInput);
        let isOnlyNumber = /^\d+$/.test(this.state.searchInput);
        let response;
        if (!isVerifiedAddress && !isOnlyNumber) {
            let promise = new Promise((resolve, reject) => {
                let data = fetchLatestListings(this.state.searchInput);
                if (data) {
                    resolve(data);
                } else {
                    reject(Error('error'));
                }

            })

            promise.then(result => {
                this.setState({loading: true});
                setTimeout(() => {
                    this.setState({loading: false});
                    this.setState({data: result});
                }, 1500)

            }, function (error) {
                console.log(error);
                this.setState({error: error});

            })
        }
        if (isVerifiedAddress) {
            let request = new Promise((resolve, reject) => {
                let data = fetchLatestListings({address: this.state.searchInput});
                if (data) {
                    resolve(data);
                } else {
                    reject(Error('error'));
                }
            })
            request.then(result => {
                this.setState({loading: true});
                if (result.length !== 0) {
                    response = result;
                } else {
                    response = [];
                }
                setTimeout(() => {
                    this.setState({data: response});
                    this.setState({loading: false});
                }, 1500)

            }, function (error) {
                console.log(error);
                this.setState({error: error});
            })
        }
        if (isOnlyNumber) {
            let request = new Promise((resolve, reject) => {
                let data = getCatGirlInfo(false, fetchCatGirlNFT(this.state.searchInput));
                if (data) {
                    resolve(data);
                } else {
                    reject(Error('error'));
                }
            })
            request.then(result => {
                this.setState({loading: true});
                setTimeout(() => {
                    this.setState({loading: false});
                    this.setState({data: [result]});
                }, 1500)

            }, function (error) {
                console.log(error);

                this.setState({error: error});
            })
        }


        //this.setState({['data']: {}})

    }

    render() {

        let data = this.state.data;
        const {searchInput, bnbPrice, loading} = this.state;
        let tableData = {columns, data}
        if ((data.length === 1 && data[0].length === 0) || (data === undefined || data.length === 0)) {
            data = ['0'];
        }

        return data.length > 0 ?
            <div className={'App'}>
                <Container className={'cattable-container '} fluid>
                    <Row>
                        <Col md={6} className={'d-inline-block'}>
                            <InputGroup className="">
                                <form onSubmit={this.handleAddressSubmit}>
                                    <FormControl
                                        aria-label="NTF Look Up"
                                        aria-describedby="basic-addon2"
                                        type="text"
                                        name="searchInput"
                                        value={searchInput}
                                        onChange={this.onAddressInput}
                                        placeholder="Lookup by ID or Address"
                                    />

                                    <Button type={'submit'} className={"hidden-button"} variant="outline-secondary"
                                            id="button-addon2">
                                        Button
                                    </Button>
                                </form>
                            </InputGroup>
                        </Col>
                        <Col md={6}>
                            <div className={'h-100 d-flex justify-content-center align-items-center'}>
                                <a href="https://www.catgirl.io"><img title="Alchemists Neko Fetish" alt="Alchemists Neko Fetish" src="https://count.getloli.com/get/@drmaxis@cattable-prod?theme=rule34"/> </a>
                            </div>
                        </Col>
                    </Row>

                    <Button onClick={this.refreshData} className={'mb-3'} variant="outline-success">Refresh Table</Button>{' '}
                    <div  className={(loading === true ? 'd-flex' : 'hidden-element') + ' loader h-100 align-items-center' }>
                        <a href={'https://www.github.com/DrMaxis'}><img width="100px;" src={AlchemistBlock} alt={'Alchemists Block'} title={'Alchemists Block'}/></a>
                    </div>
                    <div>
                        Current BNB price: ${parseFloat(bnbPrice).toFixed(2)}
                    </div>


                    <Row>
                        <Col md={12}>
                            <DataTableExtensions {...tableData} >
                                <DataTable
                                    title="CatGirl NFT Listings"
                                    pagination
                                    print={false}
                                    export={false}
                                    highlightOnHover
                                    filter
                                    expandableRows={true}
                                    expandableRowsComponent={ExpandedComponent}
                                    expandOnRowClicked={false}
                                    expandOnRowDoubleClicked={false}
                                    expandableRowsHideExpander={false}
                                />
                            </DataTableExtensions>
                        </Col>


                    </Row>
                </Container>
            </div>

            : (

                <div className={'App'}>
                    <div className={'loader-container'} >
                        <div className={'loader h-100 d-flex justify-content-center align-items-center'}>
                            <span>Loading...</span>
                           <a href={'https://www.github.com/DrMaxis'}><img width="100px;" src={AlchemistBlock} alt={'Alchemists Block'} title={'Alchemists Block'}/></a>
                        </div>
                    </div>
                </div>
            );

    }
}

export default App;
