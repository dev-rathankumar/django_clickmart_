const QuantitySelector = ({
  quantity,
  onQuantityChange,
  min = 0, 
  max = 99,
}) => {
  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 0;
    const clampedValue = Math.max(0, Math.min(max, value));
    onQuantityChange(clampedValue);
  };

  return (
    <div className="quantity-selector d-flex align-items-center">
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={handleDecrement}
        disabled={quantity <= 0}
      >
        <i className="bi bi-dash"></i>
      </button>

      <input
        type="number"
        className="form-control text-center mx-2"
        style={{ width: "60px", height: "32px" }}
        value={quantity}
        onChange={handleInputChange}
      />

      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={handleIncrement}
        disabled={quantity >= max}
      >
        <i className="bi bi-plus"></i>
      </button>
    </div>
  );
};

export default QuantitySelector;
