import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import MainHeader from '../../../Common/mainHeader';
import './ViewBats.css';
import Swal from 'sweetalert2';
import { CartContext } from '../../../context/CartContext'; // Corrected path

const ViewBats = () => {
  const [bats, setBats] = useState([]);
  const [filteredBats, setFilteredBats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBat, setSelectedBat] = useState(null);
  const api = process.env.REACT_APP_BASE_URL;
  const { addToCart } = useContext(CartContext); // Access addToCart from context

  const fetchBats = useCallback(async () => {
    try {
      const response = await axios.get(`${api}/api/bats`);
      let sortedBats = response.data.sort((a, b) => b.stock - a.stock);
      setBats(sortedBats);
      setFilteredBats(sortedBats);
    } catch (error) {
      console.error('Error fetching bats:', error);
    }
  }, [api]);

  useEffect(() => {
    fetchBats();
  }, [fetchBats]);

  useEffect(() => {
    const results = bats.filter((bat) => {
      const searchString = `${bat.brand} ${bat.model}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
    let sortedResults = results.sort((a, b) => b.stock - a.stock);
    setFilteredBats(sortedResults);
  }, [searchTerm, bats]);

  const handleBatClick = (bat) => {
    setSelectedBat(bat);
  };

  const handleCloseDetails = () => {
    setSelectedBat(null);
  };

  const handleAddToCart = (bat) => {
    if (bat.stock > 0) {
      addToCart(bat); // Use addToCart from context
      Swal.fire({
        icon: 'success',
        title: 'Added to Cart!',
        text: `${bat.brand} ${bat.model} has been added to your cart.`,
      });
      handleCloseDetails();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Out of Stock',
        text: `Sorry, ${bat.brand} ${bat.model} is currently out of stock.`,
      });
    }
  };

  return (
    <div className="bat-shop-container">
      <MainHeader />
      <div className="bat-shop-content">
        <h2 className="bat-shop-title">Explore Cricket Bats</h2>
        <div className="bat-shop-filter">
          <input
            type="text"
            placeholder="Search bats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bat-shop-search"
          />
        </div>
        <div className="bat-shop-grid">
          {filteredBats.map((bat) => (
            <div key={bat._id} className="bat-shop-item" onClick={() => handleBatClick(bat)}>
              <div className="bat-shop-image-container">
                {bat.images && bat.images.length > 0 && (
                  <img
                    src={`${api}/uploads/${bat.images[0]}`}
                    alt={bat.model}
                    className="bat-shop-image"
                  />
                )}
              </div>
              <div className="bat-shop-details">
                <h3 className="bat-shop-name">{bat.brand} {bat.model}</h3>
                <div className="bat-shop-price-stock">
                  <p className="bat-shop-price">
                    LKR {bat.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className={`bat-shop-stock ${bat.stock > 0 ? 'bat-shop-stock-in' : 'bat-shop-stock-out'}`}>
                    {bat.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {selectedBat && (
          <div className="bat-details-overlay">
            <div className="bat-details-modal">
              <button className="bat-details-close" onClick={handleCloseDetails}>
                &times;
              </button>
              <div className="bat-details-content">
                <div className="bat-details-image-section">
                  {selectedBat.images && selectedBat.images.length > 0 && (
                    <img
                      src={`${api}/uploads/${selectedBat.images[0]}`}
                      alt={selectedBat.model}
                      className="bat-details-image"
                    />
                  )}
                </div>
                <div className="bat-details-info-section">
                  <h2 className="bat-details-title">{selectedBat.brand} {selectedBat.model}</h2>
                  <p className="bat-details-info"><strong>Wood:</strong> {selectedBat.woodType}</p>
                  <p className="bat-details-info"><strong>Grade:</strong> {selectedBat.grade}</p>
                  <p className="bat-details-info"><strong>Weight:</strong> {selectedBat.weight}</p>
                  <p className="bat-details-price">
                    <strong>Price:</strong> LKR {selectedBat.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className={`bat-details-stock ${selectedBat.stock > 0 ? 'bat-details-stock-in' : 'bat-details-stock-out'}`}>
                    <strong>Stock:</strong> {selectedBat.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </p>
                  <p className="bat-details-description"><strong>Description:</strong> {selectedBat.description || 'No description available.'}</p>
                  <button className="bat-details-add-to-cart" onClick={() => handleAddToCart(selectedBat)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBats;