import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

const createEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionsContract;
}

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setformData] = useState({ addressTo: '', amount: '', keyword: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
    };

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) {
                return alert('Please install metamask.');
            }

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
            } else {
                console.log('No accounts found.');
            }
        } catch (error) {
            throw new Error('No ethereum object.');
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) {
                return alert('Please install metamask.');
            }

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            setCurrentAccount(accounts[0]);
        } catch (error) {
            throw new Error('No ethereum object.');
        }
    }

    const sendTransaction = async () => {
        try {
            if (ethereum) {
                const { addressTo, amount, keyword, message } = formData;
                const transactionsContract = createEthereumContract();
                const parsedAmount = ethers.utils.parseEther(amount);

                await ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: currentAccount,
                        to: addressTo,
                        gas: '0x5208',
                        value: parsedAmount._hex,
                    }],
                });

                const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

                setIsLoading(true);
                console.log(`Loading - ${transactionHash.hash}`);
                await transactionHash.wait();
                console.log(`Success - ${transactionHash.hash}`);
                setIsLoading(false);

                const transactionsCount = await transactionsContract.getTransactionCount();

                setTransactionCount(transactionsCount.toNumber());
                window.location.reload();
            } else {
                console.log('No ethereum object');
            }
        } catch (error) {
            console.log(error);
            throw new Error('No ethereum object');
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, transactions, isLoading, sendTransaction, handleChange }}>
            {children}
        </TransactionContext.Provider>
    )
}
