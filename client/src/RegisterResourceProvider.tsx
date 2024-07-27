import React, { useState } from 'react';
import { Form, InputNumber, Input, Button, Select, Card, message } from 'antd';
import { AptosClient} from 'aptos';
import { useWallet , InputTransactionData} from "@aptos-labs/wallet-adapter-react";
import { Aptos } from "@aptos-labs/ts-sdk";
import './ShareResources.css';

const { TextArea } = Input;
const { Option } = Select;
export const aptos = new Aptos();
// change this to be your module account address
export const moduleAddress = "0xfc83896de2f3a2d647f232f149f690cf3c1ac3137c0771df82cc6f04fa9c28c9";

const client = new AptosClient('https://fullnode.testnet.aptoslabs.com'); // Adjust URL for your network

const ShareResources: React.FC = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [resourceCategory, setResourceCategory] = useState('computing');
  const [resourceType, setResourceType] = useState('gpu');
  const [ram, setRam] = useState(0);
  const [cache, setCache] = useState(0);
  const [availableTime, setAvailableTime] = useState(0);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [transactionInProgress, setTransactionInProgress] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!account) {
      console.error("No connected wallet account.");
      message.error('No connected wallet account.');
      return;
    }
    const transaction:InputTransactionData = {
      data:{
        function: `${moduleAddress}::TrusTrain::register_resources`, // Replace with your actual module and function
        functionArguments:[
        resourceCategory,
        resourceType,
        ram.toString(),
        cache.toString(),
        availableTime.toString(),
        additionalInfo
      ]
       // Add type arguments if your function requires them
      }
    };

    // Set the transaction in progress state
    setTransactionInProgress(true);

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});
      
    } catch (error: any) {
      message.error("error")
    } finally {
      setTransactionInProgress(false);
    }
 
  };

  return (
    <div className="share-resources">
      <Card title="Share Your Resources" bordered={false}>
        <p>
          Fill out the form below to share your computing resources or datasets. Ensure that all information is accurate to help users find and utilize your resources effectively.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="resource-category">Resource Category:</label>
            <select id="resource-category" name="resource-category" value={resourceCategory} onChange={(e) => setResourceCategory(e.target.value)}>
              <option value="computing">Computing</option>
              <option value="dataset">Dataset</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="resource-type">Resource Type:</label>
            <select id="resource-type" name="resource-type" value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
              <option value="gpu">GPU</option>
              <option value="cpu">CPU</option>
              <option value="ram">RAM</option>
              <option value="storage">Google Collab</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="ram">RAM (in GB):</label>
            <input type="number" id="ram" name="ram" value={ram} onChange={(e) => setRam(Number(e.target.value))} placeholder="Enter Amount of RAM" />
          </div>
          <div className="form-group">
            <label htmlFor="cache">Cache (in GB):</label>
            <input type="number" id="cache" name="cache" value={cache} onChange={(e) => setCache(Number(e.target.value))} placeholder="Enter Amount of Cache" />
          </div>
          <div className="form-group">
            <label htmlFor="available-time">Available Time (in hours per week):</label>
            <input type="number" id="available-time" name="available-time" value={availableTime} onChange={(e) => setAvailableTime(Number(e.target.value))} placeholder="Enter Available Time" />
          </div>
          <div className="form-group">
            <label htmlFor="additional-info">Additional Information:</label>
            <textarea id="additional-info" name="additional-info" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Provide any additional details or notes here"></textarea>
          </div>
          <button type="submit" disabled={transactionInProgress}>Share Resource</button>
        </form>
      </Card>
    </div>
  );
};

export default ShareResources;
