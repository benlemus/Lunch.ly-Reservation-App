/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");
const ExpressError = require("../expressError");

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests = 1, startAt, notes = "" }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** getter/setter for notes */

  get notes() {
    return this._notes;
  }

  set notes(value) {
    this._notes = value ? String(value) : "";
  }

  /** getter/setter for numGuests */

  get numGuests() {
    return this._numGuests;
  }

  set numGuests(value) {
    const num = Number(value);
    if (Number.isInteger(num) && num >= 1) {
      this._numGuests = num;
    } else {
      throw new ExpressError("Reservation must be for at least 1 person", 400);
    }
  }

  /** getter/setter for startAt */

  get startAt() {
    return this._startAt;
  }

  set startAt(date) {
    if (date instanceof Date && !isNaN(date)) {
      this._startAt = date;
    } else {
      throw new ExpressError("startAt must be a valid Date object", 400);
    }
  }

  /** getter/setter for customerId */

  get customerId() {
    return this._customerId;
  }

  set customerId(id) {
    if (this._customerId === undefined) {
      this._customerId = id;
    } else {
      throw new ExpressError("Reservation already assigned to id", 400);
    }
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
      [customerId]
    );

    return results.rows.map((row) => new Reservation(row));
  }

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.startAt, this.numGuests, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET start_at=$1, num_guests=$2, notes=$3
          WHERE id=$4`,
        [this.startAt, this.numGuests, this.notes, this.id]
      );
    }
  }
}

module.exports = Reservation;
