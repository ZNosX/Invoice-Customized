/**
 * Data and settings for the company
 *
 * How to properly enter your data:
 * Be sure when entering your information to enclose that data with double quotes. When entering numbers they
 * don't need to be enclosed with quotes, in general the sample data below should be used as general guide on
 * how to properly enter your data. And if you have double (or single) quotes in your data (like My "Awesome" Company)
 * than you should use something we call escaping special characters with the backslash sign (\) so the final
 * company name will be "My \"Awesome\" Company".
 */

var ib_invoice_data = {
  "{gst_no}"                : "GST# 12345 6789 RT0001",
  "{company_logo}"          : "", // base64 encoded data URI of PNG image
  "{company_name}"          : "Client Name",
  "{company_address}"       : "Ship Address",
  "{company_city_zip_state}": "City, Zip and Country",
  "{company_phone_fax}"     : "Contact Number",
  "{company_email_web}"     : "http://client.site | info@client.com",
  "{payment_info1}"         : "",
  "{payment_info2}"         : "",
  "{payment_info3}"         : "",
  "{payment_info4}"         : "",
  "{payment_info5}"         : "",
  "{docket_label}"          : "Docket #",
  "{docket_number}"         : "1234",
  "{cc_label}"              : "CC #",
  "{cc_number}"             : "1234",
  "{order_no_label}"        : "Order No.",
  "{order_no}"              : "1234",
  "{rep_no_label}"          : "Rep.",
  "{rep_no}"                : "HOUSE",
  "{issue_date_label}"      : "Issue Date:",
  "{issue_date}"            : "",
  "{net_term_label}"        : "Net:",
  "{net_term}"              : 0,
  "{due_date_label}"        : "Due Date:",
  "{due_date}"              : "",
  "{currency_label}"        : "Currency:",
  "{currency}"              : "CAD",
  "{po_number_label}"       : "P.O. #",
  "{po_number}"             : "1/3-147",
  "{bill_to_label}"         : "Bill to:",
  "{client_name}"           : "Client Name",
  "{client_address}"        : "Client Address",
  "{client_city_zip_state}" : "City, Zip and Country",
  "{client_phone_fax}"      : "Contact Number",
  "{client_email}"          : "info@client.com",
  "{client_other}"          : "Contact Info",
  "{invoice_title}"         : "INVOICE #",
  "{invoice_number}"        : "123456789",
  "{item_row_number_label}" : "",
  "{item_description_label}": "Item",
  "{item_quantity_label}"   : "Quantity",
  "{item_price_label}"      : "Price",
  "{item_discount_label}"   : "Discount",
  "{item_tax_label}"        : "Tax",
  "{item_line_total_label}" : "Linetotal",
  "{item_row_number}"       : "",
  "{item_description}"      : "",
  "{item_quantity}"         : "",
  "{item_price}"            : "",
  "{item_discount}"         : "",
  "{item_tax}"              : "",
  "{item_line_total}"       : "",
  "{amount_subtotal_label}" : "Subtotal:",
  "{amount_subtotal}"       : "",
  "{tax_name}"              : "Tax:",
  "{tax_value}"             : "",
  "{amount_total_label}"    : "Total:",
  "{amount_total}"          : "",
  "{amount_paid_label}"     : "Paid:",
  "{amount_due_label}"      : "Amount Due:",
  "{amount_due}"            : "",
  "{terms_label}"           : "Terms: Wire Transfer",
  "{terms}"                 : "1.5% per month interest may be charged on overdue invoices<br />Payments returned NSF are subject to a $50.00 charge.",

  // Settings
  "date_format"             : "mm/dd/yyyy", // One of 'dd/mm/yyyy', 'dd-mm-yyyy', 'dd.mm.yyyy', 'mm/dd/yyyy', 'mm-dd-yyyy', 'mm.dd.yyyy', 'yyyy mm dd', 'yyyy-mm-dd', 'yyyy.mm.dd'
  "currency_position"       : "left", // One of 'left' or 'right'
  "number_format"           : "0,000.00", // One of '0,000.00', '0000.00', '0.000,00', or '0000,00'
  "default_columns"         : ["item_row_number", "item_description", "item_quantity", "item_price", "item_tax", "item_line_total"],
  "default_quantity"        : "0",
  "default_price"           : "0",
  "default_discount"        : "0",
  "default_tax"             : "13",
  "default_number_rows"     : 2,
  "auto_calculate_dates"    : true,
  "load_items"              : true,
  "invoicebus_fineprint"    : true,

  // Items
  "items": [
    {
      "item_description" : "Default Items",
      "item_quantity"    : "100",
      "item_price"       : "1",
      "item_discount"    : "",
      "item_tax"         : "13"
    },
    {
      "item_description" : "",
      "item_quantity"    : "",
      "item_price"       : "",
      "item_discount"    : "",
      "item_tax"         : ""
    }
  ]
};
