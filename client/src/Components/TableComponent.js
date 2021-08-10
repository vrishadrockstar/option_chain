import React from "react";

const arrTypes = ["NIFTY", "BANKNIFTY", "FINNIFTY"];

class TableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      expiryDates: [],
      selectedDate: "",
      selectedType: "",
      CE: {},
      PE: {},
    };
    this.onSort = this.onSort.bind(this);
    this.changeDate = this.changeDate.bind(this);
    this.changeType = this.changeType.bind(this);
  }

  fetchData(date, order, type) {
    fetch("/api/data?date=" + date + "&order=" + order + "&type=" + type)
      .then(function (response) {
        return response.json();
      })
      .then((result) => {
        this.setState({
          data: result.data,
          expiryDates: result.expiryDates,
          selectedDate: result.selectedDate,
          selectedType: result.selectedType,
          CE: result.CE,
          PE: result.PE,
        });
      });
  }

  componentDidMount() {
    this.fetchData();
  }

  onSort(event) {
    this.fetchData(
      this.state.selectedDate,
      event.target.title,
      this.state.selectedType
    );
  }

  changeDate(event) {
    this.fetchData(event.target.value);
  }

  changeType(event) {
    this.fetchData(this.state.selectedDate, null, event.target.value);
  }

  render() {
    const newdata = this.state.data;
    const expiryDates = this.state.expiryDates;
    const selectedDate = this.state.selectedDate;
    const selectedType = this.state.selectedType;
    const CE = this.state.CE;
    const PE = this.state.PE;
    return (
      <table>
        <thead>
          <tr>
            <th>
              Expiry Date
              <select onChange={this.changeDate} selected={selectedDate}>
                {expiryDates.map((date) => {
                  return (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  );
                })}
              </select>
              <select onChange={this.changeType} selected={selectedType}>
                {arrTypes.map((type) => {
                  return (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  );
                })}
              </select>
            </th>
            <th colSpan="5">CE</th>
            <th colSpan="5">PE</th>
          </tr>
          <tr>
            <th title="Strike_Price" onClick={this.onSort}>
              Strike Price
            </th>
            <th title="CALL_OI" onClick={this.onSort}>
              OI
            </th>
            <th title="CALL_OI_CHANGE" onClick={this.onSort}>
              CHANGE IN OI
            </th>
            <th title="CALL_VOL" onClick={this.onSort}>
              VOL
            </th>
            <th title="CALL_IV" onClick={this.onSort}>
              IV
            </th>
            <th title="CALL_LTP" onClick={this.onSort}>
              LTP
            </th>
            <th title="PUT_OI" onClick={this.onSort}>
              OI
            </th>
            <th title="PUT_OI_CHANGE" onClick={this.onSort}>
              CHANGE IN OI
            </th>
            <th title="PUT_VOL" onClick={this.onSort}>
              VOL
            </th>
            <th title="PUT_IV" onClick={this.onSort}>
              IV
            </th>
            <th title="PUT_LTP" onClick={this.onSort}>
              LTP
            </th>
          </tr>
        </thead>
        <tbody>
          {newdata.map(function (unit, index) {
            return (
              <tr key={index} data-item={unit}>
                <td>{unit.Strike_Price}</td>
                <td>{unit.CALL_OI}</td>
                <td>{unit.CALL_OI_CHANGE}</td>
                <td>{unit.CALL_VOL}</td>
                <td>{unit.CALL_IV}</td>
                <td>{unit.CALL_LTP}</td>
                <td>{unit.PUT_OI}</td>
                <td>{unit.PUT_OI_CHANGE}</td>
                <td>{unit.PUT_VOL}</td>
                <td>{unit.PUT_IV}</td>
                <td>{unit.PUT_LTP}</td>
              </tr>
            );
          })}
          <tr>
            <td>Total</td>
            <td>{CE.totOI || 0}</td>
            <td></td>
            <td>{CE.totVol || 0}</td>
            <td></td>
            <td></td>
            <td>{PE.totOI || 0}</td>
            <td></td>
            <td>{PE.totVol || 0}</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>Ratio</td>
            <td colSpan="5">{(PE.totOI / CE.totOI).toFixed(3) || 0}(OI)</td>
            <td colSpan="5">
              {(PE.totVol / CE.totVol).toFixed(3) || 0}(Volume)
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

export default TableComponent;
