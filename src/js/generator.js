/**
 * Invoice Template Generator by Invoicebus
 */

(function () {

  /*
   * Initially hide the html and body elements
   */
  document.getElementsByTagName('html')[0].style.position = 'absolute';
  document.getElementsByTagName('html')[0].style.top = '-100000px';

  document.body.style.position = 'absolute';
  document.body.style.top = '-100000px';

  // Utility function to get the generator script path
  var ib_getGeneratorScriptPath = function() {
    var scripts = document.getElementsByTagName('script');
    for(var i = 0; i < scripts.length; i++)
    {
      var src = scripts[i].src;

      var idx = src.indexOf('generator' + MIN + '.js');
      if(idx > -1)
      {
        return src.substring(0, idx);
      }
    }
  };

  /**
   * Constants
   */
  var BLANK_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',

      TRACKING  = '@@TRACKING',
      SAVE_URL  = '@@SAVE_URL',
      MIN       = '@@MIN',

      // Get the path of the generator script
      PATH      = ib_getGeneratorScriptPath(),
      // jQuery and Bootstrap paths
      JQUERY    = PATH + 'jquery.min.js',
      BOOTSTRAP = PATH + 'bootstrap.min.js';

  /**
   * Show error bar function
   */
  var ib_showErrorBar = function() {
    var el = document.createElement('div');
    el.innerHTML = "Oops sorry, the template cannot be rendered. Mind checking your internet connection?";
    el.setAttribute('style', 'position:fixed; top:0px; left:0px; background:#f75520; color:white; text-align:center; width:100%; padding:10px 0; font:normal 14px/1.4em "Open Sans", Arial, Sans-serif; border-bottom:3px solid #fff; box-shadow:0px 0px 10px 2px #aaa;');
    document.body.appendChild(el);

    return false;
  };

  /**
   * Script loading functions
   */
  var ib_timeout = 100, // In milliseconds
      ib_total_timeout = 0,
      max_timeout = 5000;

  var ib_loadJavaScript = function(file) {
    var js = document.createElement('script');
    js.async = true;
    js.type = 'text/javascript';
    js.src = file;
    document.body.appendChild(js);
  };

  var ib_checkJQuery = function(callback) {
    if(ib_total_timeout > max_timeout)
      return ib_showErrorBar();

    if (window.jQuery)
    {
      ib_loadJavaScript(BOOTSTRAP);
      ib_checkBootstrap(callback);
    }
    else
      setTimeout(function() { ib_checkJQuery(callback); }, ib_timeout);
    
    ib_total_timeout += ib_timeout;
  };

  var ib_checkBootstrap = function(callback) {
    if(ib_total_timeout > max_timeout)
      return ib_showErrorBar();

    if(jQuery.fn.tooltip)
      callback(jQuery);
    else
      setTimeout(function() { ib_checkBootstrap(callback); }, ib_timeout);

    ib_total_timeout += ib_timeout;
  };

  /**
   * Main init function
   */
  var ib_initGenerator = function() {
    $(function() {

      // First strip all input elements
      ib_stripForbiddenTags();
      
      // Load bootstrap components
      ib_loadBootstrapDatepicker();
      ib_loadBootstrapTypeahead();

      // Init the invoice dependencies
      ib_initCurrencies();
      ib_initInvoiceData();
      ib_initDates();

      // Init the invoice functionality
      ib_initTemplate();

      // Init bootstrap components
      ib_initDatepickers();
      ib_initTypeahead();

      // Init the items grid
      ib_initItemsTable();

      // Init the logo functionality
      ib_initLogoTag();
      ib_initLogoUpload();

      // Init the main styles and actions
      ib_initStylesAndActions();

      // Init tooltip at the end when everything is in its place
      ib_initBootstrapTooltip();

      checkIfCssLoaded();
      
    });
  };

  /**
   * Utility functions
   */
  var checkIfCssLoaded = function() {
    var check_css = setInterval(function() {
      for(var i = 0; i < document.styleSheets.length; i++) {
        if(document.styleSheets[i].href.indexOf('generator' + MIN + '.css') != -1)
        {
          // When the main generator stylesheet is loaded show the html and body elements
          $('html').removeAttr('style');
          $('body').removeAttr('style');

          clearInterval(check_css);

          // For internal Invoicebus usage
          window.status = 'finished';
          break;
        }
      }
    }, 10);
  };

  var ALLOWED_TAGS =
  [
    'a',
    'b',
    'body',
    'br',
    'div',
    'em',
    'footer',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hr',
    'html',
    'i',
    'img',
    'label',
    'li',
    'link',
    'meta',
    'ol',
    'p',
    'pre',
    'section',
    // 'script', // Allow for debugging, otherwise comment it
    'span',
    'strong',
    'style',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'title',
    'tr',
    'ul'
  ];

  var ALLOWED_ATTR =
  [
    'cellpadding',
    'cellspacing',
    'charset',
    'class',
    'colspan',
    'content',
    'data-hide-on-quote',
    'data-iterate',
    'data-logo',
    'dir',
    'height',
    'href',
    'http-equiv',
    'id',
    'lang',
    'name',
    'rel',
    'rowspan',
    'src',
    'style',
    'title',
    'type',
    'width'
  ];

  var ib_stripForbiddenTags = function() {
    // Clear the html of all forbidden tags
    $(document).find(':not(' + ALLOWED_TAGS.join(',') + ')').remove();

    // Clear the html of all forbidden attributes
    $('*').each(function() {
      for(var i = 0; i < this.attributes.length; i++)
        if(ALLOWED_ATTR.indexOf(this.attributes[i].name) == -1)
          this.removeAttribute(this.attributes[i].name);
    });

    // Remove href="javascript:..." attribute on <a> tags
    $(document).find('a').each(function() {
      if($(this).attr('href').indexOf('javascript') === 0) $(this).removeAttr('href');
    });
  };
  
  var ib_isIE = function () {
    // Detect if the browser is IE
    var ua = navigator.userAgent;
    return ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1 || ua.indexOf('Edge/') > -1;
  };

  var ib_isSafari = function () {
    // Detect if the browser is Safari
    var ua = navigator.userAgent;
    return ua.indexOf('Safari/') > -1 && !(ua.indexOf('Chrome/') > -1 || ua.indexOf('OPR/') > -1);
  };

  var ib_fixNewlines = function(text) {
    if(text)
      return text
              .replace(/<div>/gi, '<br />')
              .replace(/<\/div>/gi, '')
              .replace(/<\/p>(\r*|\n*)<p>/gi, '<br />')
              .replace(/<(p|\/p)>/gi, '')
              .replace(/<br\s*(\/|\s*)>/gi, '\n');

    return text;
  };

  var ib_stripHtml = function(text) {
    if(text)
      return $('<div />').html(text).text();

    return text;
  };

  var ib_initBootstrapTooltip = function() {
    // Wait a little before init the tooltip
    setTimeout(function() {
      $(document).tooltip({
        selector: '[data-tooltip="tooltip"]',
        html: true,
        container: 'body'
      });
    }, 200);
  };

  var ib_highlighted = false;

  var ib_highlightEditable = function() {
    var fields = $('[contenteditable="true"], [data-ibcl-id="issue_date"], [data-ibcl-id="due_date"]');
    if(ib_highlighted)
    {
      fields.addClass('ib_editable_outline ib_stop_animate');
      $('.ib_highlight_editable').addClass('active active_hover');
    }
    else
    {
      fields.removeClass('ib_editable_outline');
      $('.ib_highlight_editable').removeClass('active active_hover');
    }
  };

  var ib_initStylesAndActions = function() {
    $('head')
      .prepend('<link rel="stylesheet" href="' + PATH + 'generator' + MIN + '.css" media="all" />');

    $(document.body)
      .before($('<ib-span class="ib_invoice_commands_wrap">' +
                  '<ib-span class="ib_invoice_commands">' +
                    '<ib-span id="ib-print-btn" class="ib_default_button" data-tooltip="tooltip" data-placement="bottom" title="This command is also used to save<br/>the invoice as PDF. See FAQ for more info."><i class="fa fa-print"></i> Print Invoice</ib-span>' +
                    '<ib-span class="ib_default_button ib_highlight_editable" data-tooltip="tooltip" data-placement="bottom" title="Highlight editable fields"><i class="fa fa-edit"></i> Highlight Fields</ib-span>' +
                    '<ib-span id="ib-save-data-btn" class="ib_default_button" data-toggle="modal" data-target="#ib_saveCurrentStateModal" data-tooltip="tooltip" data-placement="bottom" title="Save current invoice data such as<br/>company address, logo, etc., for future re-use"><i class="fa fa-bolt"></i> Save Current State</ib-span>' +
                    '<iframe id="ib_download_data_frame" class="ib_force_hide"></iframe>' +
                    '<ib-span class="ib_default_button ib_save_online" data-tooltip="tooltip" data-placement="bottom" title="Invoice will be saved to DataBase<br/>Prototype v1.0"><i class="fa fa-cloud-upload"></i> Save Invoice </ib-span>' +
                    '<ib-span class="ib_save_info" data-tooltip="tooltip" data-placement="right" title="You\'ll need Invoicebus account to save this invoice"><i class="fa fa-question-circle"></i></ib-span>' +

                    '<ib-span class="ib_gray_link ib_how_to_link ib_pull_right" data-toggle="modal" data-target="#ib_howToModal">About</ib-span>' +
                    '<ib-span class="ib_top_separator ib_pull_right">●</ib-span>' +
                    '<ib-span class="ib_gray_link ib_how_to_link ib_pull_right" onclick="">DCR Strategies Inc.</ib-span>' +
                  '</ib-span>' +
                '</ib-span>'))
      .after($('<ib-span class="ib_invoicebus_love">Invoice Prototype v1.0<br><ib-span onclick="return false;">DCR Strategies Inc.</ib-span></ib-span>'));

      var modal_save = '<ib-div id="ib_saveCurrentStateModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="howToModal" aria-hidden="true">' +
                   '<ib-div class="modal-dialog">' +
                    '<ib-div class="modal-content">' +
                      '<ib-div class="modal-header">' +
                        '<ib-span type="button" class="close" data-dismiss="modal"><ib-span aria-hidden="true">&times;</ib-span></ib-span>' +
                        '<ib-div class="modal-title" id="howToModal">Save current state</ib-div>' +
                      '</ib-div>' +
                      '<ib-div class="modal-body">' +
                        '<ib-div class="ib_how_to_container">@@SAVE_STATE</ib-div>' +
                      '</ib-div>' +
                    '</ib-div>' +
                  '</ib-div>' +
                '</ib-div>';

    $(document.body)
      .after($(modal_save));

    $('#ib-print-btn').click(function() {
      ib_highlighted = false;
      ib_highlightEditable();

      window.print();
    });
    
    $('#ib-save-data-btn').click(function() {
      if(ib_isSafari())
      {
        var raw_data = ib_getCurrentState();
        $('#ib-save-current-data').attr('href', 'data:text/plain;charset=UTF-8,' + encodeURIComponent(raw_data));

        $('#ib-safari-save-as').removeClass('ib_hide');
      }
    });

    $('#ib-save-current-data').click(function() {
      var raw_data = ib_getCurrentState();

      if(ib_isIE()) {
        var iframe_doc = ib_download_data_frame.document || ib_download_data_frame.contentDocument || ib_download_data_frame.contentWindow.document;

        iframe_doc.open('text/html', 'replace');
        iframe_doc.write('<pre>' + raw_data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>'); // pre-format the data to preserve newlines when saving
        iframe_doc.close();
        
        ib_download_data_frame.focus();

        iframe_doc.execCommand('SaveAs', true, 'data.txt');
      }
      else
        $(this).attr('href', 'data:text/plain;charset=UTF-8,' + encodeURIComponent(raw_data));
    });

    $('.ib_highlight_editable').click(function() {
      ib_highlighted = !ib_highlighted;

      ib_highlightEditable();
    });

    $(document).scroll(function(e) {
      if(document.body.scrollTop === 0 && document.documentElement.scrollTop === 0)
        $('.ib_invoice_commands_wrap').removeClass('ib_commands_shadow');
      else if(!$('.ib_invoice_commands_wrap').hasClass('ib_commands_shadow'))
        $('.ib_invoice_commands_wrap').addClass('ib_commands_shadow');
    });

    //$(document.body)
    //  .after($('<ib-span class="ib_invoicebus_fineprint">Manage your invoices super easy at <ib-span onclick="window.open(\'https://invoicebus.com\', \'_blank\')">invoicebus.com</ib-span></ib-span>'));

    //if(!JSON.parse(ib_data.invoicebus_fineprint))
    //  $('.ib_invoicebus_fineprint').css('visibility', 'hidden');

    $('.ib_save_online').click(ib_saveInvoice);
    
    $('[data-iterate="item"]:last').after($('<ib-span class="ib_bottom_row_commands"><ib-span class="ib_blue_link ib_add_new_row_link">Add new row</ib-span><ib-span class="ib_blue_link ib_show_hide_columns_link">Configure Columns</ib-span></ib-span>'));

    $('.ib_add_new_row_link').click(function(e) {
      ib_addRow(this, e);
    });

    $('.ib_show_hide_columns_link')
      .after($('<ib-span class="ib_show_hide_columns">' +
                  '<ib-span>' +
                    '<input type="checkbox" value="item_row_number" />' +
                    '<ib-span>Row number</ib-span>' +
                  '</ib-span>' +
                  '<ib-span>' +
                    '<input type="checkbox" value="item_description" />' +
                    '<ib-span>Description</ib-span>' +
                  '</ib-span>' +
                  '<ib-span>' +
                    '<input type="checkbox" value="item_quantity" />' +
                    '<ib-span>Quantity</ib-span>' +
                  '</ib-span>' +
                  '<ib-span>' +
                    '<input type="checkbox" value="item_price" />' +
                    '<ib-span>Price</ib-span>' +
                  '</ib-span>' +
                  '<ib-span>' +
                    '<input type="checkbox" value="item_discount" />' +
                    '<ib-span>Discount</ib-span>' +
                  '</ib-span>' +
                  '<ib-span>' +
                    '<input type="checkbox" value="item_tax" />' +
                    '<ib-span>Tax</ib-span>' +
                  '</ib-span>' +
                  '<ib-span>' +
                    '<input type="checkbox" value="item_line_total" />' +
                    '<ib-span>Line total</ib-span>' +
                  '</ib-span>' +
                '</ib-span>'));

    $('.ib_show_hide_columns_link, .ib_show_hide_columns').hover(function(e) {
      $('.ib_show_hide_columns').css('display', 'block');
    }, function(e) {
      $('.ib_show_hide_columns').hide();
    });

    $('.ib_show_hide_columns > ib-span > ib-span').click(function() {
      var chk = $(this).parent().find('input:checkbox');
      chk.prop('checked', !chk.is(':checked'));
      chk.change();
    });

    $('.ib_show_hide_columns > ib-span > input:checkbox').change(function() {
      var column = $(this).val();
      if(column == 'item_row_number') // This is special case that we need to handle because of the row commands
        $('[data-ibcl-id="' + column + '_label"], [data-ibcl-id="' + column + '"]').toggleClass('ib_hide_column', !$(this).is(':checked'));
      else
      {
        $('[data-ibcl-id="' + column + '_label"], [data-ibcl-id="' + column + '"]')
          .toggle($(this).is(':checked'));

        if($('[data-ibcl-id="' + column + '_label"]').hasClass('ibcl_ie_contenteditable'))
          $('[data-ibcl-id="' + column + '_label"]').parent().toggle($(this).is(':checked'));

        if($('[data-ibcl-id="' + column + '"]').hasClass('ibcl_ie_contenteditable'))
          $('[data-ibcl-id="' + column + '"]').parent().toggle($(this).is(':checked'));

        ib_calculateTotals();
      }
    });

    // Set the initial checkboxes state
    for(var i = 0; i < ib_data.default_columns.length; i++) {
      $('input[type="checkbox"][value="' + ib_data.default_columns[i] + '"]').prop('checked', true);
    }

    $('.ib_show_hide_columns > ib-span > input:checkbox').change();

    var modal = '<ib-div id="ib_howToModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="howToModal" aria-hidden="true">' +
                   '<ib-div class="modal-dialog">' +
                    '<ib-div class="modal-content">' +
                      '<ib-div class="modal-header">' +
                        '<ib-span type="button" class="close" data-dismiss="modal"><ib-span aria-hidden="true">&times;</ib-span></ib-span>' +
                        '<ib-div class="modal-title" id="howToModal">About</ib-div>' +
                      '</ib-div>' +
                      '<ib-div class="modal-body">' +
                        '<ib-div class="ib_how_to_container">@@HOWTO</ib-div>' +
                      '</ib-div>' +
                      '<ib-div class="modal-footer">' +
                        '<ib-span class="ib_default_button" data-dismiss="modal">OK, got it</ib-span>' +
                      '</ib-div>' +
                    '</ib-div>' +
                  '</ib-div>' +
                '</ib-div>';

    $(document.body)
      .after($(modal));
  };

  var ib_getScriptQueryVariables = function() {
    var scripts = document.getElementsByTagName('script');
    for(var i = 0; i < scripts.length; i++)
    {
      var src = scripts[i].src;

      if(src.indexOf('generator' + MIN + '.js?') > -1)
      {
        return src.substring(src.indexOf('?') + 1);
      }
    }
  };

  /**
   * Template functions
   */
  var ib_data,
      ib_data_timeout = 0;

  var ib_initInvoiceData = function() {
    ib_data = {
      '{company_logo}'          : '',
      '{company_name}'          : { default_text: 'Dino Store', tooltip: 'Enter your company name' },
      '{company_address}'       : { default_text: '227 Cobblestone Road', tooltip: 'Enter company\'s address' },
      '{company_city_zip_state}': { default_text: '30000 Bedrock, Cobblestone County', tooltip: 'Enter company\'s zip, city and country' },
      '{company_phone_fax}'     : { default_text: '+555 7 789-1234', tooltip: 'Enter company\'s contact phones' },
      '{company_email_web}'     : { default_text: 'http://dinostore.bed | hello@dinostore.bed', tooltip: 'Enter company\'s web and email address' },
      '{payment_info1}'         : { default_text: 'Payment details:', tooltip: 'Enter your payment details' },
      '{payment_info2}'         : { default_text: 'ACC:123006705', tooltip: 'Enter other payment details' },
      '{payment_info3}'         : { default_text: 'IBAN:US100000060345', tooltip: 'Enter other payment details' },
      '{payment_info4}'         : { default_text: 'SWIFT:BOA447', tooltip: 'Enter other payment details' },
      '{payment_info5}'         : { default_text: '', tooltip: 'Enter other payment details' },
      '{payment_info6}'         : { default_text: '', tooltip: 'Enter other payment details' },
      '{payment_info7}'         : { default_text: '', tooltip: 'Enter other payment details' },
      '{payment_info8}'         : { default_text: '', tooltip: 'Enter other payment details' },
      '{issue_date_label}'      : { default_text: 'Issue Date:', tooltip: 'Enter issue date label' },
      '{issue_date}'            : { default_text: '', tooltip: 'Select invoice issue date' },
      '{order_no_label}'        : { default_text: 'Order No.', tooltip: 'Enter order number label' },
      '{order_no}'              : { default_text: '', tooltip: 'Enter order number' },
      '{rep_no_label}'          : { default_text: 'Rep.', tooltip: 'Enter rep number label' },
      '{rep_no}'                : { default_text: '', tooltip: 'Enter rep number' },
      '{gst_no_label}'          : { default_text: 'GST # ', tooltip: 'Enter GST number label' },
      '{gst_no}'                : { default_text: '', tooltip: 'Enter file number' },
      '{net_term_label}'        : { default_text: 'Net:', tooltip: 'Enter net days label' },
      '{net_term}'              : { default_text: 21, tooltip: 'Enter invoice net days' },
      '{due_date_label}'        : { default_text: 'Due Date:', tooltip: 'Enter invoice due date label' },
      '{due_date}'              : { default_text: '', tooltip: 'Select invoice due date' },
      '{currency_label}'        : { default_text: 'Currency:', tooltip: 'Enter invoice currency label' },
      '{currency}'              : { default_text: 'USD', tooltip: 'Enter invoice currency' },
      '{po_number_label}'       : { default_text: 'P.O. #', tooltip: 'Enter P.O. label' },
      '{po_number}'             : { default_text: '1/3-147', tooltip: 'Enter P.O. Number' },
      '{bill_to_label}'         : { default_text: 'Bill to:', tooltip: 'Enter bill to label' },
      '{client_name}'           : { default_text: 'Slate Rock and Gravel Company', tooltip: 'Enter client name' },
      '{client_address}'        : { default_text: '222 Rocky Way', tooltip: 'Enter client address' },
      '{client_city_zip_state}' : { default_text: '30000 Bedrock, Cobblestone County', tooltip: 'Enter client city, zip, country' },
      '{client_phone_fax}'      : { default_text: '+555 7 123-5555', tooltip: 'Enter client pnone & fax' },
      '{client_email}'          : { default_text: 'fred@slaterockgravel.bed', tooltip: 'Enter client email' },
      '{client_other}'          : { default_text: 'Attn: Fred Flintstone', tooltip: 'Enter other client info' },
      '{invoice_title}'         : { default_text: 'INVOICE #', tooltip: 'Enter invoice title' },
      '{invoice_number}'        : { default_text: '', tooltip: 'Enter invoice number' },
      '{item_row_number_label}' : { default_text: '', tooltip: '' },
      '{item_description_label}': { default_text: 'Item', tooltip: 'Enter item header' },
      '{item_quantity_label}'   : { default_text: 'Quantity', tooltip: 'Enter quantity header' },
      '{item_price_label}'      : { default_text: 'Price', tooltip: 'Enter price header' },
      '{item_discount_label}'   : { default_text: 'Discount', tooltip: 'Enter discount header' },
      '{item_tax_label}'        : { default_text: 'Tax', tooltip: 'Enter tax header' },
      '{item_line_total_label}' : { default_text: 'Linetotal', tooltip: 'Enter line total header' },
      '{item_row_number}'       : { default_text: '', tooltip: '' },
      '{item_description}'      : { default_text: '', tooltip: 'Enter item description' },
      '{item_quantity}'         : { default_text: '', tooltip: 'Enter quantity' },
      '{item_price}'            : { default_text: '', tooltip: 'Enter price' },
      '{item_discount}'         : { default_text: '', tooltip: 'Enter discount' },
      '{item_tax}'              : { default_text: '', tooltip: 'Enter tax' },
      '{item_line_total}'       : { default_text: '', tooltip: '' },
      '{amount_subtotal_label}' : { default_text: 'Subtotal:', tooltip: 'Enter subtotal label' },
      '{amount_subtotal}'       : { default_text: '', tooltip: '' },
      '{tax_name}'              : { default_text: 'Tax:', tooltip: 'Enter tax label' },
      '{tax_value}'             : { default_text: '', tooltip: '' },
      '{amount_total_label}'    : { default_text: 'Total:', tooltip: 'Enter total label' },
      '{amount_total}'          : { default_text: '', tooltip: '' },
      '{amount_paid_label}'     : { default_text: 'Paid:', tooltip: 'Enter amount paid label' },
      '{amount_paid}'           : { default_text: '', tooltip: 'Enter amount paid' },
      '{amount_due_label}'      : { default_text: 'Amount Due:', tooltip: 'Enter amount due label' },
      '{amount_due}'            : { default_text: '', tooltip: '' },
      '{terms_label}'           : { default_text: 'Terms & Notes', tooltip: 'Enter terms and notes label' },
      '{terms}'                 : { default_text: 'Fred, thank you very much. We really appreciate your business.<br />Please send payments before the due date.', tooltip: 'Enter invoice terms and notes' },
      '{title}'                 : { default_text: 'INVOICE', tooltip: 'Enter title name' },
      '{docket_label}'          : { default_text: 'Docket #', tooltip: 'Enter docket label' },
      '{docket_number}'         : { default_text: '0000', tooltip: 'Enter docket number' },
      '{cc_label}'              : { default_text: 'CC #', tooltip: 'Enter CC label' },
      '{cc_number}'             : { default_text: '0000', tooltip: 'Enter CC number' },

      // Settings
      'date_format'             : 'mm/dd/yyyy', // One of 'dd/mm/yyyy', 'dd-mm-yyyy', 'dd.mm.yyyy', 'mm/dd/yyyy', 'mm-dd-yyyy', 'mm.dd.yyyy', 'yyyy mm dd', 'yyyy-mm-dd', 'yyyy.mm.dd'
      'currency_position'       : 'left', // One of 'left' or 'right'
      'number_format'           : '0,000.00', // One of '0,000.00', '0000.00', '0.000,00', or '0000,00'
      'default_columns'         : ['item_row_number', 'item_description', 'item_quantity', 'item_price', 'item_discount', 'item_tax', 'item_line_total'],
      'default_quantity'        : '1',
      'default_price'           : '0',
      'default_discount'        : '0',
      'default_tax'             : '13',
      'default_number_rows'     : 2,
      'auto_calculate_dates'    : true,
      'load_items'              : true,
      'invoicebus_fineprint'    : true,

      // Items
      'items': [
        {
          'item_description' : 'DCR Generic Cards',
          'item_quantity'    : '500',
          'item_price'       : '5.00',
          'item_tax'         : '13%'
        },
        {
          'item_description' : '',
          'item_quantity'    : '',
          'item_price'       : '',
          'item_tax'         : ''
        }
      ]
    };

    ib_loadCompanyData();
  };

  var ib_loadCompanyData = function() {
    if(ib_data_timeout > max_timeout)
      return; // Stop with loading

    if(typeof ib_invoice_data !== 'undefined')
    {
      if(typeof ib_invoice_data == 'function') // new data format
      {
        // Make it JSON same as the legacy data format
        ib_invoice_data = ib_parseData(ib_multiline.stripIndent(ib_invoice_data));
      }

      for(var key in ib_invoice_data)
      {
        if(typeof ib_data[key] === 'undefined')
        {
          ib_data[key] = { default_text: ib_invoice_data[key], tooltip: 'Enter ' + key.replace(/{(document|client)_custom_([a-zA-Z0-9_]+)}/gi, '$1 $2').replace(/_/g, ' ') };
        }

        if(typeof ib_data[key].default_text !== 'undefined')
          ib_data[key].default_text = ib_invoice_data[key];
        else
          ib_data[key] = ib_invoice_data[key];
      }

      ib_currency_position = ib_invoice_data.currency_position;
      ib_number_format     = ib_invoice_data.number_format;

      if(ib_number_format)
        ib_decimal_separator = ib_number_format[ib_number_format.length - 3];

      ib_currency_symbol = $(ib_currencies).map(function(idx, val) {
                                                  if(val.code == ib_data['{currency}'].default_text)
                                                    return val.symbol;
                                                })[0];
    }
    else
      setTimeout(function() { ib_loadCompanyData(); }, ib_timeout);

    ib_data_timeout += ib_timeout;
  };

  var ib_initTemplate = function() {
    ib_processHtml();
    ib_addFieldListeners();
  };

  var ib_processHtml = function() {
    ib_replacePlaceholder('{company_name}');
    ib_replacePlaceholder('{company_address}');
    ib_replacePlaceholder('{company_city_zip_state}');
    ib_replacePlaceholder('{company_phone_fax}');
    ib_replacePlaceholder('{company_email_web}');
    ib_replacePlaceholder('{payment_info1}');
    ib_replacePlaceholder('{payment_info2}');
    ib_replacePlaceholder('{payment_info3}');
    ib_replacePlaceholder('{payment_info4}');
    ib_replacePlaceholder('{issue_date_label}');
    ib_replacePlaceholder('{issue_date}', true, { 'data-date': ib_issue_date_formated });
    ib_replacePlaceholder('{net_term_label}');
    ib_replacePlaceholder('{net_term}');
    ib_replacePlaceholder('{order_no_label}');
    ib_replacePlaceholder('{order_no}');
    ib_replacePlaceholder('{rep_no_label}');
    ib_replacePlaceholder('{rep_no}');
    ib_replacePlaceholder('{gst_no_label}');
    ib_replacePlaceholder('{gst_no}');
    ib_replacePlaceholder('{due_date_label}');
    ib_replacePlaceholder('{due_date}', true, { 'data-date': ib_due_date_formated });
    ib_replacePlaceholder('{currency_label}');
    ib_replacePlaceholder('{currency}');
    ib_replacePlaceholder('{po_number_label}');
    ib_replacePlaceholder('{po_number}');
    ib_replacePlaceholder('{bill_to_label}');
    ib_replacePlaceholder('{payment_info5}');
    ib_replacePlaceholder('{payment_info6}');
    ib_replacePlaceholder('{payment_info7}');
    ib_replacePlaceholder('{payment_info8}');
    ib_replacePlaceholder('{client_name}');
    ib_replacePlaceholder('{title}');
    ib_replacePlaceholder('{docket_label}');
    ib_replacePlaceholder('{docket_number}');
    ib_replacePlaceholder('{cc_label}');
    ib_replacePlaceholder('{cc_number}');
    ib_replacePlaceholder('{client_address}');
    ib_replacePlaceholder('{client_city_zip_state}');
    ib_replacePlaceholder('{client_phone_fax}');
    ib_replacePlaceholder('{client_email}');
    ib_replacePlaceholder('{client_other}');
    ib_replacePlaceholder('{invoice_title}');
    ib_replacePlaceholder('{invoice_number}');
    ib_replacePlaceholder('{item_row_number_label}', true);
    ib_replacePlaceholder('{item_description_label}');
    ib_replacePlaceholder('{item_quantity_label}');
    ib_replacePlaceholder('{item_price_label}');
    ib_replacePlaceholder('{item_discount_label}');
    ib_replacePlaceholder('{item_tax_label}');
    ib_replacePlaceholder('{item_line_total_label}');
    ib_replacePlaceholder('{item_row_number}', true);
    ib_replacePlaceholder('{item_description}');
    ib_replacePlaceholder('{item_quantity}');
    ib_replacePlaceholder('{item_price}');
    ib_replacePlaceholder('{item_discount}');
    ib_replacePlaceholder('{item_tax}');
    ib_replacePlaceholder('{item_line_total}', true);
    ib_replacePlaceholder('{amount_subtotal_label}');
    ib_replacePlaceholder('{amount_subtotal}', true);
    ib_replacePlaceholder('{tax_name}');
    ib_replacePlaceholder('{tax_value}', true);
    ib_replacePlaceholder('{amount_total_label}');
    ib_replacePlaceholder('{amount_total}', true);
    ib_replacePlaceholder('{amount_paid_label}');
    ib_replacePlaceholder('{amount_paid}');
    ib_replacePlaceholder('{amount_due_label}');
    ib_replacePlaceholder('{amount_due}', true);
    ib_replacePlaceholder('{terms_label}');
    ib_replacePlaceholder('{terms}');

    // Handle custom document and client fields
    $('*')
      .filter(function() {
        var el = $(this);
        return (/{document_custom_[a-zA-Z0-9_]+}/.test(el.text()) || /{client_custom_[a-zA-Z0-9_]+}/.test(el.text())) && 
        el.children().length === 0 && 
        el.prop('firstChild').nodeType == 3;
      })
      .each(function(idx, val) {
        var placeholder = $(val).text();
        
        if(typeof ib_data[placeholder] === 'undefined')
          ib_data[placeholder] = { default_text: '', tooltip: 'Enter ' + placeholder.replace(/{(document|client)_custom_([a-zA-Z0-9_]+)}/gi, '$1 $2').replace(/_/g, ' ') };

        ib_replacePlaceholder(placeholder);
      });
  };

  var ib_replacePlaceholder = function(id, not_editable, attr) {
    var data_id = id.substring(1, id.length - 1),
        notEditableByIE = "TABLE,COL,COLGROUP,TBODY,TD,TFOOT,TH,THEAD,TR".split(',');

    var elements = $('*:contains("' + id + '")');
    for(var i = 0; i < elements.length; i++)
    {
      if($(elements[i]).children().length === 0 && $(elements[i]).prop('firstChild').nodeType == 3 /* TEXT NODE */)
      {
        var el = $(elements[i]);

        if(ib_isIE() && notEditableByIE.indexOf(el.prop("tagName")) > -1 && !not_editable)
        {
          var tmp_el = $('<ib-span class="ibcl_ie_contenteditable" contenteditable="true"></ib-span>');
          
          el.html(tmp_el);
          el = tmp_el;
        }

        el.attr('data-ibcl-id', data_id)
          .addClass('ibcl_' + data_id)
          .attr('data-tooltip', 'tooltip')
          .attr('data-placement', 'top')
          .attr('title', ib_data[id].tooltip)
          .html(ib_data[id].default_text);
        
        if(attr)
          el.attr(attr);
        
        if(!not_editable)
          el.attr('contenteditable', 'true');
      }
    }
  };

  var ib_addFieldListeners = function() {
    // This will update all fields for the same placeholder with the typed value
    $('[data-ibcl-id]').on('keydown keyup', function(e) {
      var field = $(this).data('ibcl-id');
      // Don't apply this for the item fields, they don't need to update their values
      if(['item_row_number', 'item_description', 'item_quantity', 'item_price', 'item_tax_percentage', 'item_tax', 'item_discount', 'item_line_total'].indexOf(field) == -1)
      {
        var value = $(this).html();

        $('[data-ibcl-id="' + field + '"]').each(function(idx, val) {
          if($(val).html() !== value) // only update the field if the value is different
            $(val).html(value);
        });
      }
    });
  };

  /**
   * Logo functions
   */
  var ib_max_width     = 820, // Because the maximum template width is 820px the logo should be also maximum 820px wide
      ib_max_height    = 820,
      ratio            = 1,
      ib_logo_width    = 0,
      ib_logo_height   = 0,
      ib_canvas_width  = 820,
      ib_canvas_height = 820;

  var ib_initLogoTag = function() {
    $('[data-logo="{company_logo}"]')
      .attr('data-logo', 'company_logo')
      .attr('src', BLANK_GIF);
  };

  var ib_initLogoUpload = function() {
    var logo_img = $('[data-logo="company_logo"]').attr('src', BLANK_GIF);

    $(document).bind('drop dragover', function (e) {
      e.stopPropagation();
      e.preventDefault();
      
      e.originalEvent.dataTransfer.dropEffect = 'none';
    });

    logo_img
      .after($('<ib-div class="ib_remove_logo_overlay" data-tooltip="tooltip" data-placement="top"><ib-span class="ib_remove_logo" title="Remove logo"><i class="fa fa-times-circle"></i></ib-span></ib-div>')
        .hover(
          function() { },
          function() {
            $('.ib_remove_logo_overlay').hide();
          }
        ));

    logo_img.hover(
      function() {
        if(logo_img.attr('src') !== '')
        {
          var lo = $('[data-logo="company_logo"]').offset();

          $('.ib_remove_logo_overlay')
            .show()
            .offset(lo)
            .width(ib_logo_width)
            .height(ib_logo_height);
        }
      },
      function() { }
    );

    // Wait for 100 ms before rendering the drag & drop container, to fix rendering issues
    setTimeout(function() {
      ib_logo_width = $('[data-logo="company_logo"]').width();
      ib_logo_height = $('[data-logo="company_logo"]').height();

      ratio = ib_logo_width / ib_logo_height;
      // Calculate the actual maximum width and height for the logo
      if(ib_logo_width > ib_logo_height)
        ib_max_height *= 1 / ratio;
      else
        ib_max_width *= ratio;

      logo_img
        .hide()
        .before($('<ib-span class="ib_drop_zone" data-tooltip="tooltip" data-placement="top" title="Drop image or click to upload your logo (max 2MB).<br>For better print resolution use larger image,<br>as it\'s automatically scaled down."><ib-span>Drop your logo here<br /><ib-span>(' + ib_logo_width + ' x ' + ib_logo_height + 'px)</ib-span><input type="file" accept="image/*" /></ib-span></ib-span>').width(ib_logo_width).height(ib_logo_height));
      
      // Setup the D&D listeners
      $('.ib_drop_zone')
        .bind('dragenter', handleDragEnter)
        .bind('dragleave', handleDragLeave)
        .bind('dragover', handleDragOver)
        .bind('drop', handleFileSelect);
        
      $('input:file').change(function(e){
        e.originalEvent.dataTransfer = { files: $(this).prop('files') };
        handleFileSelect(e);
      });

      setTimeout(function() {
        if(ib_data['{company_logo}'] && /^data:image\/.+;base64/.test(ib_data['{company_logo}']))
        {
          logo_img
            .attr('src', ib_data['{company_logo}'])
            .css('display', 'block')
            .hide()
            .show();

          $('.ib_logo_base64')
            .val($('[data-logo="company_logo"]').attr('src'));

          $('.ib_drop_zone').hide();
        }
      }, 100);
    }, 100);
    
    var handleFileSelect = function(e) {

      e.stopPropagation();
      e.preventDefault();

      var files = e.originalEvent.dataTransfer.files; // FileList object. 
      var file = files[0];
      
      if(!file)
        return;

      if(!file.type.match(/image.*/))
      {
        alert('Please upload image file. Supported formats are .png, .jpg ang .gif');
        return;
      }
      if(file.size > 2097152)
      {
        alert('File too big, maximum size is 2MB');
        return;
      }
      
      var img = new Image();
      var reader = new FileReader();
      reader.onload = function(e) { img.src = e.target.result; };
      
      img.onload = function(e) {
        var width = img.width;
        var height = img.height;

        ib_canvas_width = ib_max_width;
        ib_canvas_height = ib_max_height;

        if(width <= ib_canvas_width && width >= height) {
          ib_canvas_height = width * 1 / ratio;
          ib_canvas_width = width;
        }
        if(height <= ib_canvas_height && height >= width) {
          ib_canvas_width = height * ratio;
          ib_canvas_height = height;
        }

        if(width <= ib_logo_width && width >= height) {
          ib_canvas_height = ib_logo_width * 1 / ratio;
          ib_canvas_width = ib_logo_width;
        }
        if(height <= ib_logo_height && height >= width) {
          ib_canvas_width = ib_logo_height * ratio;
          ib_canvas_height = ib_logo_height;
        }

        if (width >= ib_canvas_width) {
          height *= ib_canvas_width / width;
          width = ib_canvas_width;
        }
        if (height >= ib_canvas_height) {
          width *= ib_canvas_height / height;
          height = ib_canvas_height;
        }
        
        if(width < 1) width = 1;
        if(height < 1) height = 1;

        var canvas = document.createElement('canvas');
        canvas.width = ib_canvas_width;
        canvas.height = ib_canvas_height;

        var left = (ib_canvas_width - width) / 2;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, left, 0, width, height);
        
        var dataurl = canvas.toDataURL("image/png");
        
        logo_img
          .attr('src', dataurl)
          .css('display', 'block')
          .hide()
          .fadeIn();

        $('.ib_logo_base64')
            .val($('[data-logo="company_logo"]').attr('src'));
        
        $('.ib_drop_zone').hide();
      };

      reader.readAsDataURL(file);
      
      $('.ib_drop_zone').removeClass('ib_border_hover');
    };

    var removeLogo = function(e) {
      e.preventDefault();
      e.stopPropagation();

      logo_img.attr('src', BLANK_GIF).hide();
      $('.ib_drop_zone').show();
      $('.ib_remove_logo_overlay').hide();
      $('input:file').val(''); // Reset the file field
    };

    var handleDragOver = function(e) {
      e.stopPropagation();
      e.preventDefault();
      
      e.originalEvent.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    };

    var handleDragEnter = function(e) {
      e.stopPropagation();
      e.preventDefault();

      $('.ib_drop_zone').addClass('ib_border_hover');
    };

    var handleDragLeave = function(e) {
      e.stopPropagation();
      e.preventDefault();

      $('.ib_drop_zone').removeClass('ib_border_hover');
    };

    $('.ib_remove_logo').click(removeLogo);
  };

  /**
   * Items grid functions
   */
  var ib_items_line, ib_tax_line;

  var ib_initItemsTable = function() {
    ib_items_line = $('[data-iterate="item"]');
    ib_tax_line = $('[data-iterate="tax"]').hide().clone();

    var num = 1;
    var rows_num = parseInt(ib_data.default_number_rows);

    if(typeof ib_invoice_data !== 'undefined' && typeof ib_invoice_data.items !== 'undefined')
      ib_data.items = ib_invoice_data.items;

    // If we have more items than rows than add more rows
    if(rows_num < ib_data.items.length)
      rows_num = ib_data.items.length;

    while (num < rows_num)
    {
      $(ib_items_line).after($(ib_items_line).clone());
      num++;
    }

    ib_initRowNumbers();

    ib_items_line = ib_items_line.clone();
    
    ib_initRowCommands();

    ib_setRowData();

    ib_calculateTotals();
  };

  var ib_getExistingTax = function(taxes, tax) {
    for(var i = 0; i < taxes.length; i++)
      if(Object.keys(taxes[i])[0] == tax)
        return i;

    return -1;
  };

  var ib_getExistingTaxRow = function(tax_rows, tax_value) {
    for(var i = 0; i < tax_rows.length; i++)
    {
      tax_row = $(tax_rows[i]).find('[data-ib-value="' + tax_value.getFormatedNumber() + '"]');
      if(tax_row.length)
        return i;
    }

    return -1;
  };

  var ib_getTaxName = function(tax_value) {
    if(tax_value)
      return $('[data-iterate="tax"]:visible').find('[data-ib-value="' + tax_value.toString().getFormatedNumber() + '"]').closest('[data-iterate="tax"]').find('[data-ibcl-id="tax_name"]').text().replace(/:/gi, '');

    return '';
  };

  String.prototype.insertString = function(str, position) {
    if(this)
      return [this.slice(0, position), str, this.slice(position)].join('');

    return '';
  };

  String.prototype.getNumber = function() {
    if(this)
    {
      if(ib_decimal_separator == '.')
        return parseFloat(this.replace(/[^0-9.-]/g, ''));
      else if(ib_decimal_separator == ',')
        return parseFloat(this.replace(/[^0-9,-]/g, '').replace(/,/g, '.'));
    }

    return 0;
  };

  String.prototype.getValidNumberChars = function() {
    if(this)
      return this.replace(/[^0-9.,-]/gi, '');

    return '';
  };

  String.prototype.getFormatedNumber = function() {
    if(this)
    {
      var i, counter,
          number = this.toString(),
          minus_sign = ''; // initially there's no minus

      if(number.indexOf('-') === 0)
      {
        number = number.substring(1);
        minus_sign = '-'; // set the minus sign
      }

      if(ib_decimal_separator == '.') {
        if(ib_number_format == '0,000.00') {
          counter = 0;
          for(i = number.lastIndexOf('.') - 1; i >= 0; i--)
          {
            if(counter < 2)
            {
              counter++;
              continue;
            }
            else {
              counter = 0;
              number = number.insertString(',', i);
            }
          }
        }
        else if(ib_number_format == '0000.00') {
          // don't do anything, the number is already in this format
        }
      }
      else if(ib_decimal_separator == ',') {
        if(ib_number_format == '0.000,00') {
          number = number.replace(/\./g, ',');
          counter = 0;
          for(i = number.lastIndexOf(',') - 1; i >= 0; i--)
          {
            if(counter < 2)
            {
              counter++;
              continue;
            }
            else {
              counter = 0;
              number = number.insertString('.', i);
            }
          }
        }
        else if(ib_number_format == '0000,00') {
          number = number.replace(/\./g, ',');
        }
      }

      if(number[0] == '.' || number[0] == ',')
        number = number.substring(1);

      return minus_sign + number;
    }
    return this;
  };

  // Override the native toFixed function to prevent imprecisions of floating-point arithmetics
  Number.prototype.toFixed = function(precision) {
    if(!precision) precision = 0;

    var num = (+(Math.round(+(this.toString() + 'e' + precision)).toString() + 'e' + -precision)).toString();

    if(num.indexOf('.') == -1 && precision > 0)
      num += '.';

    var counter = 0;
    for(var i = num.indexOf('.') + 1; i <= num.length; i++)
    {
      if(num[i] === undefined && counter < precision)
      {
        num += '0';
      }
      counter++;
    }

    return num;
  };

  var ib_calculateTotals = function() {
    var rows = $('[data-iterate="item"]');

    var sum_total = 0,
        tax_total = 0,
        line_tax = 0,
        taxes = [],
        amount_paid,
        amount_due,
        j;

    for(var i = 0; i < rows.length; i++)
    {
      var row = $(rows[i]);

      var item_quantity = row.find('[data-ibcl-id="item_quantity"]:visible').text().getNumber() || ib_data.default_quantity.getNumber();
      var item_price    = row.find('[data-ibcl-id="item_price"]:visible').text().getNumber()    || ib_data.default_price;
      var item_discount = row.find('[data-ibcl-id="item_discount"]:visible').text().getNumber() || ib_data.default_discount.getNumber();
      var item_tax      = row.find('[data-ibcl-id="item_tax"]:visible').text().getNumber()      || ib_data.default_tax.getNumber();

      // Handle discount percentage (%) sign with pseudo element
      if(!isNaN(row.find('[data-ibcl-id="item_discount"]').text().getNumber()))
        row.find('[data-ibcl-id="item_discount"]').addClass('ib_item_percentage').find('br, p, div').remove();
      else
        row.find('[data-ibcl-id="item_discount"]').removeClass('ib_item_percentage').find('br, p, div').remove();

      // Handle tax percentage (%) sign with pseudo element
      if(!isNaN(row.find('[data-ibcl-id="item_tax"]').text().getNumber()))
        row.find('[data-ibcl-id="item_tax"]').addClass('ib_item_percentage').find('br, p, div').remove();
      else
        row.find('[data-ibcl-id="item_tax"]').removeClass('ib_item_percentage').find('br, p, div').remove();
      
      var item_line_total = row.find('[data-ibcl-id="item_line_total"]:visible');
      
      amount_paid = $('[data-ibcl-id="amount_paid"]').text().getNumber();
      amount_due  = $('[data-ibcl-id="amount_due"]').text().getNumber();
      
      var line_sum = 0, tax = 0, discount = 0;
      if(!isNaN(item_quantity) && !isNaN(item_price))
        line_sum = item_quantity * item_price;
      
      if(!isNaN(item_discount))
        line_sum -= line_sum * (item_discount / 100);
        
      sum_total += line_sum;

      // taxes are always calculated in percentage
      if(!isNaN(item_tax)) {
        tax = item_tax / 100;
      }

      line_tax = line_sum * tax;
      tax_total += line_tax;

      if(item_tax !== 0)
      {
        var tax_tmp = {};
        tax_tmp[item_tax] = line_tax;

        var t = ib_getExistingTax(taxes, item_tax);
        if(t > -1)
          taxes[t][item_tax] += line_tax;
        else
          taxes.push(tax_tmp);
      }

      item_line_total.text(line_sum !== 0 ? line_sum.toFixed(2).getFormatedNumber() : '');
    }

    var tax_rows = [], tax_row, tax_value;
    // Get the already existing tax rows
    for(j = 0; j < taxes.length; j++)
    {
      tax_value = Object.keys(taxes[j])[0];
      tax_row = $('[data-iterate="tax"]:visible').find('[data-ib-value="' + tax_value.getFormatedNumber() + '"]').closest('[data-iterate="tax"]');
      if(tax_row.length)
        tax_rows.push($(tax_row).clone());
    }

    // Remove all visible tax rows
    $('[data-iterate="tax"]:visible').remove();

    // Add tax rows for the new taxes and insert the existing ones
    for(j = 0; j < taxes.length; j++)
    {
      tax_value = Object.keys(taxes[j])[0];
      var tr = ib_getExistingTaxRow(tax_rows, tax_value);
      if(tr > -1)
        $('[data-iterate="tax"]:hidden').before(tax_rows[tr]);
      else
      {
        tax_row = ib_tax_line.clone().show();

        var tax_name      = tax_row.find('[data-ibcl-id="tax_name"]'),
            tax_name_text = tax_name.text().trim(),
            colon         = tax_name_text.lastIndexOf(':');

        if(colon == -1 || colon != tax_name_text.length - 1) colon = tax_name_text.length;

        tax_name.text(tax_name_text.substring(0, colon) + ' ' + (j + 1) + tax_name_text.substring(colon, tax_name_text.length));

        tax_row.find('[data-ibcl-id="tax_value"]').attr('data-ib-value', Object.keys(taxes[j])[0].getFormatedNumber());
        $('[data-iterate="tax"]:hidden').before(tax_row);
      }
    }

    // Set the calculated tax
    for(j = 0; j < taxes.length; j++)
    {
      tax_value = Object.keys(taxes[j])[0];
      tax_row = ib_currency_position == 'left' ? ib_currency_symbol + taxes[j][tax_value].toFixed(2).getFormatedNumber() : taxes[j][tax_value].toFixed(2).getFormatedNumber() + ib_currency_symbol;
      $('[data-iterate="tax"]').find('[data-ib-value="' + tax_value.getFormatedNumber() + '"]').html(tax_row);
    }

    var amount_total = sum_total + tax_total;
    
    if(isNaN(amount_paid))
    {
      amount_paid = 0;
      $('[data-ibcl-id="amount_paid"]').text(amount_paid.toFixed(2).getFormatedNumber());
    }
    if(isNaN(amount_due)) amount_due = 0;
    
    amount_due = amount_total - amount_paid;
    
    sum_total    = ib_currency_position == 'left' ? ib_currency_symbol + sum_total.toFixed(2).getFormatedNumber() : sum_total.toFixed(2).getFormatedNumber() + ib_currency_symbol;
    amount_total = ib_currency_position == 'left' ? ib_currency_symbol + amount_total.toFixed(2).getFormatedNumber() : amount_total.toFixed(2).getFormatedNumber() + ib_currency_symbol;
    amount_due   = ib_currency_position == 'left' ? ib_currency_symbol + amount_due.toFixed(2).getFormatedNumber() : amount_due.toFixed(2).getFormatedNumber() + ib_currency_symbol;
    
    $('[data-ibcl-id="amount_subtotal"]').text(sum_total);
    $('[data-ibcl-id="amount_total"]').text(amount_total);
    $('[data-ibcl-id="amount_due"]').text(amount_due);

    ib_highlightEditable();
  };

  /**
   * Item row commands
   */
  var ib_initRowNumbers = function() {
    var rows = $('[data-ibcl-id="item_row_number"]');
    
    for(var i = 0; i < rows.length; i++)
      $(rows[i]).append($('<ib-span data-row-number="item_row_number"></ib-span>'));
      
    ib_resetRowNumbers();
  };

  var ib_resetRowNumbers = function() {
    var rows = $('[data-row-number="item_row_number"]');
    for(var i = 0; i < rows.length; i++)
      $(rows[i]).html(i + 1);
  };

  var ib_setRowData = function() {
    // Check to see if we're going to load dummy items ot not
    if(!JSON.parse(ib_data.load_items))
      return;

    var rows = $('[data-iterate="item"]');

    if(typeof ib_invoice_data !== 'undefined' && typeof ib_invoice_data.items !== 'undefined')
      ib_data.items = ib_invoice_data.items;

    for (var i = 0; i < ib_data.items.length; i++)
    {
      $(rows[i]).find('[data-ibcl-id="item_description"]').html(ib_data.items[i].item_description);
      $(rows[i]).find('[data-ibcl-id="item_quantity"]').html(ib_data.items[i].item_quantity);
      $(rows[i]).find('[data-ibcl-id="item_price"]').html(ib_data.items[i].item_price);
      $(rows[i]).find('[data-ibcl-id="item_discount"]').html(ib_data.items[i].item_discount.replace(/%/g, '')); // remove the percent sign
      $(rows[i]).find('[data-ibcl-id="item_tax"]').html(ib_data.items[i].item_tax.replace(/%/g, '')); // remove the percent sign
    }
  };

  var ib_initRowCommands = function() {
    var row_commands = '<ib-span class="ib_row_commands" style="height:' + $('[data-iterate="item"]').height() + 'px;"><ib-span class="ib_commands"><ib-span class="ib_add" title="Insert row"><i class="fa fa-plus"></i></ib-span><ib-span class="ib_delete" title="Remove row"><i class="fa fa-minus"></i></ib-span><ib-span class="ib_move" title="Drag to reorder"><i class="fa fa-sort"></i></ib-span></ib-span></ib-span>';
    
    $('.ib_row_commands').remove();
    
    var rows = $('[data-iterate="item"]');
    for (var i = 0; i < rows.length; i++) {
      $(rows[i]).children(':first').css('position', 'relative').prepend($(row_commands));
    }

    $('.ib_add').click(function(e) {
      ib_addRow(this, e);
    });

    $('.ib_delete').click(function(e) {
      ib_deleteRow(this, e);
    });
    
    $('[data-iterate="item"]').hover(function() { $(this).find('.ib_row_commands .ib_commands').css('display', 'block'); }, function() { $(this).find('.ib_row_commands .ib_commands').hide(); });
    
    // Init the table for drag & drop
    new ib_TableDnD(ib_resetRowNumbers, ib_getInvoiceData).init();
    
    ib_setRowsEvents();
  };

  var ib_setRowsEvents = function() {
    var rows = $('[data-iterate="item"]');

    // private
    function field_keydown(e) {
      var self = this;

      if (e.ctrlKey)
        return true;

      // allow only numbers
      if ((e.keyCode >= 35 && e.keyCode <= 40) || 
          ((e.keyCode >= 48 && e.keyCode <= 57) && !e.shiftKey) || 
          (e.keyCode >= 96 && e.keyCode <= 105) || 
          e.keyCode == 8 || e.keyCode == 9 || 
          e.keyCode == 46 || e.keyCode == 190 || e.keyCode == 110 || e.keyCode == 188 ||
          e.keyCode == 116) {
          // Don't do anything

        switch($(this).data('ibcl-id'))
        {
          case 'amount_paid':
            setTimeout(function() {
              if(isNaN(self.textContent.getNumber()))
                self.textContent = '';

              if(!isNaN(self.textContent.getNumber()) && self.textContent.indexOf('-') > 0)
                  self.textContent = '-' + self.textContent.getNumber().toFixed(2);
            }, 0);
            break;

          case 'net_term':
            $('[data-ibcl-id="net_term"], [data-ibcl-id="due_date"]').removeClass('ib_stop_animate').addClass('ib_highlight_bg');
            setTimeout(function () { $('[data-ibcl-id="net_term"], [data-ibcl-id="due_date"]').removeClass('ib_highlight_bg'); }, 10);
            break;
        }

      } else {
        switch($(this).data('ibcl-id'))
        {
          case 'item_quantity':
          case 'item_price':
          case 'item_discount':
          case 'amount_paid':
            // Allow minus (-) sign
            if((e.keyCode == 189 || e.keyCode == 109 || e.key == '-') && $(this).text().indexOf('-') == -1)
            {
              var pos = window.getSelection().extentOffset + 1;

              this.textContent = '-' + this.textContent;

              try {
                window.getSelection().collapse(self.firstChild, pos);
              } catch(err) {}
            }
            break;
        }

        e.preventDefault();
      }

      // if a decimal separator has been added, disable the '.' or ',' keys
      if(ib_decimal_separator == '.' && $(this).text().indexOf('.') != -1 && (e.keyCode == 190 || e.keyCode == 110))
        e.preventDefault(); 

      if(ib_decimal_separator == ',' && $(this).text().indexOf(',') != -1 && e.keyCode == 188)
        e.preventDefault();

      // if decimal separator is '.' than preven the ',' from being typed
      if(ib_decimal_separator == '.' && e.keyCode == 188)
        e.preventDefault();

      // if decimal separator is ',' than preven the '.' from being typed
      if(ib_decimal_separator == ',' && (e.keyCode == 190 || e.keyCode == 110))
        e.preventDefault();
        
      if($(this).data('ibcl-id') == 'net_term' && ((e.keyCode == 188 || e.keyCode == 190 || e.keyCode == 110) || ($(this).text().length >= 3 && e.keyCode >= 48 && e.keyCode <= 57 && window.getSelection().isCollapsed)))
        e.preventDefault();

      setTimeout(ib_calculateTotals, 0);

      if($(this).data('ibcl-id') == 'net_term')
        setTimeout(ib_calculateDates, 0);
    }
    
    for(var i = 0; i < rows.length; i++)
    {
      var row = $(rows[i]);
      
      var item_quantity = row.find('');
      var item_price = row.find('[data-ibcl-id="item_price"]');
      var item_discount = row.find('');
      var item_tax = row.find('');
      var item_line_total = row.find('');
      
      $('[data-ibcl-id="net_term"], [data-ibcl-id="item_quantity"], [data-ibcl-id="item_price"], [data-ibcl-id="item_discount"], [data-ibcl-id="item_tax"], [data-ibcl-id="amount_paid"], [data-ibcl-id="amount_due"]')
        .keydown(field_keydown);
    }
  };

  var ib_addRow = function(el, e) {
    e.stopPropagation();
    e.preventDefault();

    if(!$(el).hasClass('ib_add_new_row_link'))
      $(el).closest('[data-iterate="item"]').before($(ib_items_line).clone());
    else
      $(el).closest('.ib_bottom_row_commands').before($(ib_items_line).clone());
      
    ib_resetRowNumbers();
    
    // Re-initialize the row commands;
    ib_initRowCommands();

    $('.ib_show_hide_columns > ib-span > input:checkbox').each(function(idx, chk) {
      $('.ib_show_hide_columns > ib-span > input:checkbox:nth(' + idx + ')').change();
    });

    ib_highlightEditable();

    ib_calculateTotals();
  };

  var ib_deleteRow = function(el, e) {
    e.stopPropagation();
    e.preventDefault();
    
    $(el).closest('[data-iterate="item"]').remove();
    
    ib_resetRowNumbers();

    ib_calculateTotals();
  };

  /**
   * Date functions
   */
  var ib_issue_date,
      ib_due_date,
      ib_issue_date_formated,
      ib_due_date_formated;

  var ib_initDates = function() {
    ib_issue_date = new Date();
    ib_due_date = new Date(new Date().setDate(new Date().getDate() + parseInt(ib_data['{net_term}'].default_text)));

    ib_issue_date_formated = ib_formatDate(ib_issue_date, ib_data.date_format);
    ib_due_date_formated = ib_formatDate(ib_due_date, ib_data.date_format);

    ib_data['{issue_date}'].default_text = ib_issue_date_formated;
    ib_data['{due_date}'].default_text = ib_due_date_formated;
  };

  var ib_formatDate = function(date, format) {
    var separator = format.match(/[.\/\-\s].*?/),
        parts = format.split(/\W+/);

    if (!separator || !parts || parts.length === 0)
      throw new Error("Invalid date format.");

    format = { separator: separator, parts: parts };

    var val = {
      d: date.getDate(),
      m: date.getMonth() + 1,
      yy: date.getFullYear().toString().substring(2),
      yyyy: date.getFullYear()
    };

    val.dd = (val.d < 10 ? '0' : '') + val.d;
    val.mm = (val.m < 10 ? '0' : '') + val.m;
    date = [];

    for (var i = 0; i < format.parts.length; i++) {
      date.push(val[format.parts[i]]);
    }

    return date.join(format.separator);
  };

  var ib_initDatepickers = function() {
    var radios = '';
    var date_formats = ['dd/mm/yyyy', 'dd-mm-yyyy', 'dd.mm.yyyy', 'mm/dd/yyyy', 'mm-dd-yyyy', 'mm.dd.yyyy', 'yyyy mm dd', 'yyyy-mm-dd', 'yyyy.mm.dd'];
    for(var i = 0; i < date_formats.length; i++)
    {
      radios += '<ib-div><input type="radio" id="ib_date_format_radio' + i + '" name="ib_date_format_choice" value="' + date_formats[i] + '"><label for="ib_date_format_radio' + i + '">' + date_formats[i] + '</label></ib-div>';
    }

    var date_format = 
      $('<ib-div class="ib_date_format">' + radios + '</ib-div>')
        .hover(
          function() {
            $(this).show();
          },
          function() {
            $(this).hide();
          }
        );

    $(document.body).after(date_format);

    $('[data-ibcl-id="issue_date"]')
      .datepicker({
        format: ib_data.date_format
      })
      .data('datepicker');

    $('[data-ibcl-id="due_date"]')
      .datepicker({
        format: ib_data.date_format,
        onRender: function(date) {
          ib_issue_date.setHours(0,0,0,0);
          return date.valueOf() < ib_issue_date.valueOf() ? 'disabled' : '';
        }
      })
      .data('datepicker');

    $('[data-ibcl-id="issue_date"], [data-ibcl-id="due_date"]')
      .on('changeDate', function(e) {
        // Only if it's day selected, proceed with calculations
        if(e.viewMode != "days")
          return;

        $(this).text($(this).data('date'));

        var net_term = parseInt(ib_data['{net_term}'].default_text) || 0;

        if(!isNaN(parseInt($('[data-ibcl-id="net_term"]').text())))
          net_term = parseInt($('[data-ibcl-id="net_term"]').text());
        
        if($(this).data('ibcl-id') == 'issue_date')
        {
          ib_issue_date = new Date(e.date);
          if(JSON.parse(ib_data.auto_calculate_dates))
          {
            ib_due_date = new Date(e.date.setDate(ib_issue_date.getDate() + net_term));
            $('[data-ibcl-id="due_date"]').datepicker('setValue', ib_due_date).text($('[data-ibcl-id="due_date"]').data('date'));

            // Also set the issue date picker value
            $('[data-ibcl-id="issue_date"]').datepicker('setValue', ib_issue_date).text($('[data-ibcl-id="issue_date"]').data('date'));

            $('[data-ibcl-id="issue_date"], [data-ibcl-id="due_date"]').removeClass('ib_stop_animate').addClass('ib_highlight_bg');
            setTimeout(function () { $('[data-ibcl-id="issue_date"], [data-ibcl-id="due_date"]').removeClass('ib_highlight_bg'); }, 10);
          }
        }
        else if($(this).data('ibcl-id') == 'due_date')
        {
          ib_due_date = new Date(e.date);
          if(JSON.parse(ib_data.auto_calculate_dates))
          {
            net_term = Math.ceil(Math.abs((ib_due_date.getTime() - ib_issue_date.getTime()) / (24 * 60 * 60 * 1000)));
            $('[data-ibcl-id="net_term"]').text(net_term);

            $('[data-ibcl-id="net_term"], [data-ibcl-id="due_date"]').removeClass('ib_stop_animate').addClass('ib_highlight_bg');
            setTimeout(function () { $('[data-ibcl-id="net_term"], [data-ibcl-id="due_date"]').removeClass('ib_highlight_bg'); }, 10);
          }
        }
        
        $(this).datepicker('hide');
      })
      .hover(
        function() {
          var offset = $(this).offset(), width = $(this).width();
          date_format.show().offset({ top: offset.top - 5, left: offset.left + width });
        },
        function() {
          date_format.hide();
        }
      );
      
      date_format
        .find('input:radio')
        .val([ib_data.date_format])
        .change(function(e){
          ib_data.date_format = $(this).val();
          $('[data-ibcl-id="issue_date"], [data-ibcl-id="due_date"]').datepicker('setFormat', ib_data.date_format);
          $('[data-ibcl-id="issue_date"]').datepicker('setValue', ib_issue_date).text($('[data-ibcl-id="issue_date"]').data('date'));
          $('[data-ibcl-id="due_date"]').datepicker('setValue', ib_due_date).text($('[data-ibcl-id="due_date"]').data('date'));
        });
  };

  var ib_calculateDates = function() {
    var net_term = parseInt(ib_data['{net_term}'].default_text) || 0;

    if(!isNaN(parseInt($('[data-ibcl-id="net_term"]').text())))
      net_term = parseInt($('[data-ibcl-id="net_term"]').text());

    // Only auto calculate dates if it is enabled
    if(JSON.parse(ib_data.auto_calculate_dates))
    {
      ib_due_date = new Date(new Date(ib_issue_date).setDate(ib_issue_date.getDate() + net_term));

      $('[data-ibcl-id="due_date"]').datepicker('setValue', ib_due_date).text($('[data-ibcl-id="due_date"]').data('date'));
    }
  };

  /**
   * Currency and number format functions
   */
  var ib_currencies        = [],
      ib_currency_symbol   = '$',
      ib_currency_position = 'left',
      ib_number_format     = '0,000.00',
      ib_decimal_separator = '.';

  var ib_raw_currencies = 
    // name,symbol,code,priority
    'Afghan afghani,؋,AFN,255;' +
    'Albanian lek,L,ALL,255;' +
    'Algerian dinar,د.ج,DZD,255;' +
    'Angolan kwanza,Kz,AOA,255;' +
    'Argentine peso,$,ARS,255;' +
    'Armenian dram,դր.,AMD,255;' +
    'Aruban florin,ƒ,AWG,255;' +
    'Australian dollar,$,AUD,3;' +
    'Azerbaijani manat,man.,AZN,255;' +
    'Bahamian dollar,$,BSD,255;' +
    'Bahraini dinar,.د.ب,BHD,255;' +
    'Bangladeshi taka,৳,BDT,255;' +
    'Barbadian dollar,$,BBD,255;' +
    'Belarusian ruble,Br,BYR,255;' +
    'Belize dollar,$,BZD,255;' +
    'Bermudian dollar,$,BMD,255;' +
    'Bhutanese ngultrum,Nu.,BTN,255;' +
    'Bolivian boliviano,Bs.,BOB,255;' +
    'Bosnia and Herzegovina convertible mark,KM,BAM,255;' +
    'Botswana pula,P,BWP,255;' +
    'Brazilian real,R$,BRL,255;' +
    'British pound,£,GBP,5;' +
    'Brunei dollar,$,BND,255;' +
    'Bulgarian lev,лв,BGN,255;' +
    'Burundian franc,Fr,BIF,255;' +
    'Cambodian riel,៛,KHR,255;' +
    'Canadian dollar,$,CAD,2;' +
    'Cape Verdean escudo,$,CVE,255;' +
    'Cayman Islands dollar,$,KYD,255;' +
    'Central African CFA franc,Fr,XAF,255;' +
    'CFP franc,Fr,XPF,255;' +
    'Chilean peso,$,CLP,255;' +
    'Chinese yuan,¥,CNY,255;' +
    'Colombian peso,$,COP,255;' +
    'Comorian franc,Fr,KMF,255;' +
    'Congolese franc,Fr,CDF,255;' +
    'Costa Rican colón,₡,CRC,255;' +
    'Croatian kuna,kn,HRK,255;' +
    'Cuban convertible peso,$,CUC,255;' +
    'Cuban peso,$,CUP,255;' +
    'Czech koruna,Kč,CZK,255;' +
    'Danish krone,kr,DKK,255;' +
    'Djiboutian franc,Fr,DJF,255;' +
    'Dominican peso,$,DOP,255;' +
    'East Caribbean dollar,$,XCD,255;' +
    'Egyptian pound,£,EGP,255;' +
    'Eritrean nakfa,Nfk,ERN,255;' +
    'Estonian kroon[B],kr,EEK,255;' +
    'Ethiopian birr,Br,ETB,255;' +
    'Euro,€,EUR,4;' +
    'Falkland Islands pound,£,FKP,255;' +
    'Fijian dollar,$,FJD,255;' +
    'Gambian dalasi,D,GMD,255;' +
    'Georgian lari,ლ,GEL,255;' +
    'Ghanaian cedi,₵,GHS,255;' +
    'Gibraltar pound,£,GIP,255;' +
    'Guatemalan quetzal,Q,GTQ,255;' +
    'Guinean franc,Fr,GNF,255;' +
    'Guyanese dollar,$,GYD,255;' +
    'Haitian gourde,G,HTG,255;' +
    'Honduran lempira,L,HNL,255;' +
    'Hong Kong dollar,$,HKD,255;' +
    'Hungarian forint,Ft,HUF,255;' +
    'Icelandic króna,kr,ISK,255;' +
    'Indian rupee,₨,INR,255;' +
    'Indonesian rupiah,Rp,IDR,255;' +
    'Iranian rial,﷼,IRR,255;' +
    'Iraqi dinar,ع.د,IQD,255;' +
    'Israeli new shekel,₪,ILS,255;' +
    'Jamaican dollar,$,JMD,255;' +
    'Japanese yen,¥,JPY,255;' +
    'Jordanian dinar,د.ا,JOD,255;' +
    'Kazakhstani tenge,₸,KZT,255;' +
    'Kenyan shilling,Sh,KES,255;' +
    'Kuwaiti dinar,د.ك,KWD,255;' +
    'Kyrgyzstani som,лв,KGS,255;' +
    'Lao kip,₭,LAK,255;' +
    'Latvian lats,Ls,LVL,255;' +
    'Lebanese pound,ل.ل,LBP,255;' +
    'Lesotho loti,L,LSL,255;' +
    'Liberian dollar,$,LRD,255;' +
    'Libyan dinar,ل.د,LYD,255;' +
    'Lithuanian litas,Lt,LTL,255;' +
    'Macanese pataca,P,MOP,255;' +
    'Macedonian denar,ден,MKD,255;' +
    'Malagasy ariary,Ar,MGA,255;' +
    'Malawian kwacha,MK,MWK,255;' +
    'Malaysian ringgit,RM,MYR,255;' +
    'Maldivian rufiyaa,ރ.,MVR,255;' +
    'Mauritanian ouguiya,UM,MRO,255;' +
    'Mauritian rupee,₨,MUR,255;' +
    'Mexican peso,$,MXN,255;' +
    'Moldovan leu,L,MDL,255;' +
    'Mongolian tögrög,₮,MNT,255;' +
    'Moroccan dirham,د.م.,MAD,255;' +
    'Mozambican metical,MTn,MZN,255;' +
    'Myanma kyat,K,MMK,255;' +
    'Namibian dollar,$,NAD,255;' +
    'Nepalese rupee,₨,NPR,255;' +
    'Netherlands Antillean guilder,ƒ,ANG,255;' +
    'New Taiwan dollar,$,TWD,255;' +
    'New Zealand dollar,$,NZD,255;' +
    'Nicaraguan córdoba,C$,NIO,255;' +
    'Nigerian naira,₦,NGN,255;' +
    'North Korean won,₩,KPW,255;' +
    'Norwegian krone,kr,NOK,255;' +
    'Omani rial,ر.ع.,OMR,255;' +
    'Pakistani rupee,₨,PKR,255;' +
    'Panamanian balboa,B/.,PAB,255;' +
    'Papua New Guinean kina,K,PGK,255;' +
    'Paraguayan guaraní,₲,PYG,255;' +
    'Peruvian nuevo sol,S/.,PEN,255;' +
    'Philippine peso,₱,PHP,255;' +
    'Polish złoty,zł,PLN,255;' +
    'Qatari riyal,ر.ق,QAR,255;' +
    'Romanian leu,L,RON,255;' +
    'Russian ruble,р.,RUB,255;' +
    'Rwandan franc,Fr,RWF,255;' +
    'Saint Helena pound,£,SHP,255;' +
    'Salvadoran colón,₡,SVC,255;' +
    'Samoan tala,T,WST,255;' +
    'São Tomé and Príncipe dobra,Db,STD,255;' +
    'Saudi riyal,ر.س,SAR,255;' +
    'Serbian dinar,din.,RSD,255;' +
    'Seychellois rupee,₨,SCR,255;' +
    'Sierra Leonean leone,Le,SLL,255;' +
    'Singapore dollar,$,SGD,255;' +
    'Solomon Islands dollar,$,SBD,255;' +
    'Somali shilling,Sh,SOS,255;' +
    'South African rand,R,ZAR,255;' +
    'South Korean won,₩,KRW,255;' +
    'Sri Lankan rupee,Rs,LKR,255;' +
    'Sudanese pound,£,SDG,255;' +
    'Surinamese dollar,$,SRD,255;' +
    'Swazi lilangeni,L,SZL,255;' +
    'Swedish krona,kr,SEK,255;' +
    'Swiss franc,Fr,CHF,255;' +
    'Syrian pound,£,SYP,255;' +
    'Tajikistani somoni,ЅМ,TJS,255;' +
    'Tanzanian shilling,Sh,TZS,255;' +
    'Thai baht,฿,THB,255;' +
    'Tongan paʻanga,T$,TOP,255;' +
    'Trinidad and Tobago dollar,$,TTD,255;' +
    'Tunisian dinar,د.ت,TND,255;' +
    'Turkish lira,TL,TRY,255;' +
    'Turkmenistani manat,m,TMT,255;' +
    'Ugandan shilling,Sh,UGX,255;' +
    'Ukrainian hryvnia,₴,UAH,255;' +
    'United Arab Emirates dirham,د.إ,AED,255;' +
    'United States dollar,$,USD,1;' +
    'Uruguayan peso,$,UYU,255;' +
    'Uzbekistani som,лв,UZS,255;' +
    'Vanuatu vatu,Vt,VUV,255;' +
    'Venezuelan bolívar,Bs F,VEF,255;' +
    'Vietnamese đồng,₫,VND,255;' +
    'West African CFA franc,Fr,XOF,255;' +
    'Yemeni rial,﷼,YER,255;' +
    'Zambian kwacha,ZK,ZMK,255;' +
    'Zimbabwean dollar,$,ZWL,255';

  var ib_initCurrencies = function() {
    $.each(ib_raw_currencies.split(';'), function(idx, val) {
      var tmp_curr = val.split(',');
      ib_currencies.push({ name: tmp_curr[0], symbol: tmp_curr[1], code: tmp_curr[2], priority: tmp_curr[3] });
    });
  };

  var ib_initTypeahead = function() {
    var number_settings = 
      $('<ib-span class="ib_number_settings">' +
          '<table>' +
            '<tr>' +
              '<td>' +
                '<input type="radio" id="ib_currency_left" name="ib_currency" value="left" checked />' +
                '<label for="ib_currency_left" title="Show currency on left">$100</label>' +
              '</td>' +
              '<td>' +
                '<input type="radio" id="ib_number_format_1" name="ib_number_format" value="0,000.00" checked />' +
                '<label for="ib_number_format_1">1,234.56</label>' +
              '</td>' +
            '</tr>' +

            '<tr>' +
              '<td>' +
                '<input type="radio" id="ib_currency_right" name="ib_currency" value="right" />' +
                '<label for="ib_currency_right" title="Show currency on right">100$</label>' +
              '</td>' +
              '<td>' +
                '<input type="radio" id="ib_number_format_2" name="ib_number_format" value="0000.00" />' +
                '<label for="ib_number_format_2">1234.56</label>' +
              '</td>' +
            '</tr>' +

            '<tr>' +
              '<td></td>' +
              '<td>' +
                '<input type="radio" id="ib_number_format_3" name="ib_number_format" value="0.000,00" />' +
                '<label for="ib_number_format_3">1.234,56</label>' +
              '</td>' +
            '</tr>' +

            '<tr>' +
              '<td></td>' +
              '<td>' +
                '<input type="radio" id="ib_number_format_4" name="ib_number_format" value="0000,00" />' +
                '<label for="ib_number_format_4">1234,56</label>' +
              '</td>' +
            '</tr>' +
          '</table>' +
        '</ib-span>')
        .hover(
          function() {
            $(this).show();
          },
          function() {
            $(this).hide();
          }
        );

    $(document.body).after(number_settings);
    
    $('[data-ibcl-id="currency"]')
      .typeahead({
          source: function (query, process) {
            ib_currencies_combo = [];

            $.each(ib_currencies, function (idx, val) {
              ib_currencies_combo.push('<ib-span data-code=\'' + val.code + '\' data-symbol=\'' + val.symbol + '\' class="ib_currencies_item"><ib-span>' + val.code + '</ib-span><ib-span>' + val.symbol + '</ib-span><ib-span>' + val.name + '</ib-span></ib-span>');
            });
         
            process(ib_currencies_combo);
          },
          updater: function (item) {
            ib_currency_symbol = $(item).data('symbol');
            ib_calculateTotals();
            
            return $(item).data('code');
          },
          matcher: function (item) {
            if ($(item).text().toLowerCase().indexOf(this.query.trim().toLowerCase()) != -1)
              return true;
          },
          sorter: function (items) {
            return items.sort();
          },
          highlighter: function (item) {
            var text1 = $(item).children(':first').text();
            var text2 = $(item).children(':nth(1)').text();
            var text3 = $(item).children(':last').text();
            
            var html = $(item).text('').prop('outerHTML');

            var regex = new RegExp('(' + this.query + ')', 'gi');
            var bold = '<strong style="font-weight:bold;">$1</strong>';
            return $(html)
                      .html($('<ib-span />').html(text1.replace(regex, bold)).prop('outerHTML') + 
                            $('<ib-span />').html(text2.replace(regex, bold)).prop('outerHTML') +
                            $('<ib-span />').html(text3.replace(regex, bold)).prop('outerHTML'))
                      .prop('outerHTML');
          },
      })
      .blur(function(e) {
        var $this = $(this), currency = $(this).text().toUpperCase();
        ib_currency_symbol = '';
        $this.text(currency);
        
        $.each(ib_currencies, function(idx, val) {
          if(val.code.toUpperCase() == currency)
          {
            $this.text(val.code);
            ib_currency_symbol = val.symbol;
            ib_calculateTotals();
            return;
          }
        });
      })
      .hover(
        function() {
          var offset = $(this).offset(), width = $(this).width();
          number_settings.show().offset({ top: offset.top - 5, left: offset.left + width + 1 });
        },
        function() {
          number_settings.hide();
        }
      );

    $('[name="ib_currency"][value="' + ib_currency_position + '"]').attr('checked','checked');

    $('[name="ib_number_format"][value="' + ib_number_format + '"]').attr('checked','checked');

    $('[name="ib_currency"]').change(function(e) {
      ib_currency_position = $(this).val();
      ib_calculateTotals();
    });

    $('[name="ib_number_format"]').change(function(e) {
      ib_number_format = $(this).val();
      if(ib_number_format)
        ib_decimal_separator = ib_number_format[ib_number_format.length - 3];

      var rows = $('[data-iterate="item"]');
      for(var i = 0; i < rows.length; i++)
      {
        var row = $(rows[i]);

        row.find('[data-ibcl-id="item_quantity"]').text(row.find('[data-ibcl-id="item_quantity"]').text().replace(/[.,]/g, ib_decimal_separator));
        row.find('[data-ibcl-id="item_price"]').text(row.find('[data-ibcl-id="item_price"]').text().replace(/[.,]/g, ib_decimal_separator));
        row.find('[data-ibcl-id="item_discount"]').text(row.find('[data-ibcl-id="item_discount"]').text().replace(/[.,]/g, ib_decimal_separator));
        row.find('[data-ibcl-id="item_tax"]').text(row.find('[data-ibcl-id="item_tax"]').text().replace(/[.,]/g, ib_decimal_separator));
      }

      ib_calculateTotals();
    });
  };

  /**
   * Get invoice data
   */
  var ib_getInvoiceData = function() {
    var data = {
      'hash'                   : '',
      'type'                   : 'invoice',
      'title'                  : '',
      'docket_label'           : '',
      'docket_number'          : '',
      'cc_label'               : '',
      'cc_number'              : '',
      'company_logo'           : '',
      'company_name'           : '',
      'company_address'        : '',
      'company_city_zip_state' : '',
      'company_phone_fax'      : '',
      'company_email_web'      : '',
      'payment_info1'          : '',
      'payment_info2'          : '',
      'payment_info3'          : '',
      'payment_info4'          : '',
      'payment_info5'          : '',
      'payment_info6'          : '',
      'payment_info7'          : '',
      'payment_info8'          : '',
      'issue_date_label'       : '',
      'issue_date'             : '',
      'order_no_label'         : '',
      'order_no'               : '',
      'rep_no_label'           : '',
      'rep_no'                 : '',
      'gst_no_label'           : '',
      'gst_no'                 : '',
      'net_term_label'         : '',
      'net_term'               : '0',
      'due_date_label'         : '',
      'due_date'               : '',
      'currency_label'         : '',
      'po_number_label'        : '',
      'po_number'              : '',
      'bill_to_label'          : '',
      'client_name'            : '',
      'client_address'         : '',
      'client_city_zip_state'  : '',
      'client_phone_fax'       : '',
      'client_email'           : '',
      'client_other'           : '',
      'invoice_title'          : '',
      'invoice_number'         : '',
      'item_row_number_label'  : '',
      'item_description_label' : '',
      'item_quantity_label'    : '',
      'item_price_label'       : '',
      'item_discount_label'    : '',
      'item_tax_label'         : '',
      'item_line_total_label'  : '',
      'amount_subtotal_label'  : '',
      'amount_subtotal'        : '0',
      'amount_total_label'     : '',
      'amount_total'           : '0',
      'amount_paid_label'      : '',
      'amount_paid'            : '0',
      'amount_due_label'       : '',
      'amount_due'             : '0',
      'terms_label'            : '',
      'terms'                  : '',
      'items_columns'          : [],
      'items'                  : [],
      'taxes'                  : [],
      'date_format'            : '',
      'currency_code'          : '',
      'currency_symbol'        : '',
      'currency_position'      : 'left',
      'number_format'          : '0,000.00',
      'document_custom'        : [],
      'client_custom'          : []
    };

    data.hash = $('meta[name="template-hash"]').attr('content') || data.hash;

    data.type = $('meta[name="document-type"]').attr('content') || data.type;

    if($('[data-logo="company_logo"]').is(':visible'))
      data.company_logo = $('[data-logo="company_logo"]').attr('src') || data.company_logo;
    
    $('[data-ibcl-id]').each(function(idx, val) {
      var el = $(val);
      
      data[el.data('ibcl-id')] = ib_stripHtml(ib_fixNewlines(el.html())) || data[el.data('ibcl-id')];
    });

    if(!data.net_term)
      data.net_term = Math.floor(Math.abs((ib_due_date.getTime() - ib_issue_date.getTime()) / (24 * 60 * 60 * 1000)));

    // Get the displayed columns
    $('.ib_show_hide_columns > ib-span > input:checkbox').each(function(idx, chk) {
      if($(chk).is(':checked'))
        data.items_columns.push($(chk).val());
    });
    
    // Clear the obsolete item properties, as we'll get all items from the table
    delete data.item_row_number;
    delete data.item_description;
    delete data.item_quantity;
    delete data.item_price;
    delete data.item_discount;
    delete data.item_tax;
    delete data.item_line_total;
    
    $('[data-iterate="item"]').each(function(idx, val) {
      var item_row = {};
      $(val).find('*').each(function(i, v) {
        var el = $(v);
        if(el.data('ibcl-id') && ['item_row_number', 'item_description', 'item_quantity', 'item_price', 'item_tax_percentage', 'item_tax', 'item_discount', 'item_line_total'].indexOf(el.data('ibcl-id')) != -1)
        {
          if(!el.data('ibcl-id') && ib_isIE()) // For IE get the data from editable spans
            el = el.find('.ibcl_ie_contenteditable');

          item_row[el.data('ibcl-id')] = ib_stripHtml(ib_fixNewlines(el.html()));
        }
      });

      item_row.item_row_number     = $(item_row.item_row_number).text();
      item_row.item_quantity       = item_row.item_quantity.getNumber();
      item_row.item_price          = item_row.item_price.getNumber();
      item_row.item_tax_percentage = item_row.item_tax.getNumber();
      item_row.item_tax            = ib_getTaxName(item_row.item_tax.getNumber());
      item_row.item_discount       = item_row.item_discount.getNumber();
      item_row.item_line_total     = item_row.item_line_total.getNumber();
      
      data.items.push(item_row);
    });
    
    // Clear the obsolete tax properties, as we'll get all taxes from the table
    delete data.tax_name;
    delete data.tax_value;

    $('[data-iterate="tax"]:visible').each(function(idx, val) {
      var tax_row = {};
      $(val).find('*').each(function(i, v) {
        var el = $(v);
        if(el.data('ibcl-id') && ['tax_name', 'tax_value'].indexOf(el.data('ibcl-id')) != -1)
        {
          if(!el.data('ibcl-id') && ib_isIE()) // For IE get the data from editable spans
            el = el.find('.ibcl_ie_contenteditable');

          tax_row[el.data('ibcl-id')] = ib_stripHtml(ib_fixNewlines(el.html()));
          if(el.attr('data-ib-value'))
            tax_row.tax_percentage = el.attr('data-ib-value').getNumber();
        }
      });

      tax_row.tax_value = tax_row.tax_value.getNumber();
      
      data.taxes.push(tax_row);
    });

    data.amount_subtotal = data.amount_subtotal.getNumber();
    data.amount_total    = data.amount_total.getNumber();
    data.amount_paid     = data.amount_paid.getNumber();
    data.amount_due      = data.amount_due.getNumber();
    
    // Get the date format
    data.date_format = ib_data.date_format;

    // Get currency properties
    data.currency_code     = data.currency;
    data.currency_symbol   = ib_currency_symbol;
    delete data.currency;  // Delete the old currency property

    //data.currency_position = $('.ib_number_settings input[name="ib_currency"]:checked').val();
    //data.number_format     = $('.ib_number_settings input[name="ib_number_format"]:checked').val();

    // Properly structure custom document and client fields
    for(var key in data) {
      if(/document_custom_[a-zA-Z0-9_]+/.test(key))
      {
        data.document_custom.push({
          name:  key.replace(/document_custom_([a-zA-Z0-9_]+)/, '$1'),
          type:  'constant',
          value: data[key]
        });

        delete data[key];
      }
      else if(/client_custom_[a-zA-Z0-9_]+/.test(key))
      {
        data.client_custom.push({
          name:  key.replace(/client_custom_([a-zA-Z0-9_]+)/, '$1'),
          value: data[key]
        });

        delete data[key];
      }
    }

    return data;
  };
    
  // Start Customized
  var submitInvoiceData = function (des) {
  var content = ib_getCurrentState();
  
  //variables
  var GSTNo = $('.ibcl_gst_no').text();
  var Client = $('.ibcl_client_name').text();
  var ShipTo = $('.ibcl_company_name').text();
  var InvoiceNo = $('.ibcl_invoice_number').text();
  var IssueDate = $('.ibcl_issue_date').text();
  var OrderNo = $('.ibcl_order_no').text();
  var Rep = $('.ibcl_rep_no').text();
  var DocketNo = $('.ibcl_docket_number').text();
  var CCNo = $('.ibcl_cc_number').text();
  var Currency = $('.ibcl_currency').text();
  var SubTotal = $('.ibcl_amount_subtotal').text();
  var TotalAmount = $('.ibcl_amount_total').text();
  var AmountDue = $('.ibcl_amount_due').text();
    
    $.ajax({
        type: "POST",
        url: rootURL() + '/updateInvoice',
        //contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: { data: content, description: des, GSTNo:GSTNo, Client:Client,
            ShipTo:ShipTo, InvoiceNo:InvoiceNo, IssueDate:IssueDate, OrderNo:OrderNo,
            Rep:Rep, DocketNo:DocketNo, CCNo:CCNo, Currency:Currency,SubTotal:SubTotal,
            TotalAmount:TotalAmount, AmountDue:AmountDue },
        dataType: "text",
        success: function (data) {
            alert(data);
            window.location.href = rootURL() + '/index';
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }
    });
  };
  // End Customized

  // Save online
  /**
   * Save invoice to Invoicebus
   */
  var ib_is_saving = false;
  var ib_saveInvoice = function() {
    if(ib_is_saving)
      return;

    ib_is_saving = true;

    // Add spinner so we know that something is happening
    $(this)
      .addClass('ib_disabled_button')
      .attr('disabled', 'disabled')
      .find('i.fa')
      .removeClass('fa-cloud-upload')
      .addClass('fa-spinner fa-spin');
    
    submitInvoiceData('Just a test');
    // Escape the data for sending in form post
    // var data = $('<div />').text(JSON.stringify(ib_getInvoiceData())).html().replace(/"/gi, '&quot;');

    // // Build dynamic form where the data will be submitted
    // SAVE_URL += TRACKING + '&utm_term=' + encodeURIComponent(document.title); //&utm_content=
    // $('<form id="ib_save_tamplate_form" style="display:none !important;" action="' + SAVE_URL + '" method="POST" />')
    //   .append($('<input type="hidden" name="invoice_data" value="' + data + '" />'))
    //   .appendTo($(document.body)).submit();
  };

  /**
   * Prepare currend data for download
   */
  var ib_getCurrentState = function() {
    var raw_data = '@@RAW_DATA';
    var invoice_data = ib_getInvoiceData();
    console.log(invoice_data);
    var i;

    raw_data = raw_data.replace('|item_row_number|', ib_data['{item_row_number}'].default_text);
    raw_data = raw_data.replace('|item_description|', ib_data['{item_description}'].default_text);
    raw_data = raw_data.replace('|item_quantity|', ib_data['{item_quantity}'].default_text);
    raw_data = raw_data.replace('|item_price|', ib_data['{item_price}'].default_text);
    raw_data = raw_data.replace('|item_discount|', ib_data['{item_discount}'].default_text);
    raw_data = raw_data.replace('|item_tax|', ib_data['{item_tax}'].default_text);
    raw_data = raw_data.replace('|item_line_total|', ib_data['{item_line_total}'].default_text);
    raw_data = raw_data.replace('|tax_name|', ib_data['{tax_name}'].default_text);
    raw_data = raw_data.replace('|tax_value|', ib_data['{tax_value}'].default_text);
    raw_data = raw_data.replace('|amount_total|', ib_data['{amount_total}'].default_text);
    raw_data = raw_data.replace('|amount_due|', ib_data['{amount_due}'].default_text);

    raw_data = raw_data.replace('|default_quantity|', ib_data.default_quantity);
    raw_data = raw_data.replace('|default_price|', ib_data.default_price);
    raw_data = raw_data.replace('|default_discount|', ib_data.default_discount);
    raw_data = raw_data.replace('|default_tax|', ib_data.default_tax);
    raw_data = raw_data.replace('|default_number_rows|', ib_data.default_number_rows);
    raw_data = raw_data.replace('|auto_calculate_dates|', ib_data.auto_calculate_dates);
    raw_data = raw_data.replace('|load_items|', ib_data.load_items);
    raw_data = raw_data.replace('|invoicebus_fineprint|', ib_data.invoicebus_fineprint);

    for(var key in invoice_data)
    {
      var data_key   = '|' + key + '|';
      console.log(invoice_data[key]);
      //var data_value;
      //if(key == "currency_code") { data_value = ("USD").toString().replace(/\n/g, '<br />');}
      //else { data_value = invoice_data[key].toString().replace(/\n/g, '<br />');}
      var data_value = invoice_data[key].toString().replace(/\n/g, '<br />');

      // special cases
      switch(key) {
        case 'issue_date':
        case 'due_date':
          raw_data = raw_data.replace(data_key, '');
          break;

        case 'items_columns':
          raw_data = raw_data.replace('|default_columns|', invoice_data[key].join(','));
          break;

        case 'items':
          data_value = '';
          var items = invoice_data[key];
          for(i = 0; i < items.length; i++)
          {
            data_value += (items[i].item_description    || '').toString().replace(/\n/g, '<br />') + '@||@' +
                          (items[i].item_quantity       || '').toString().replace(/\n/g, '<br />') + '@||@' +
                          (items[i].item_price          || '').toString().replace(/\n/g, '<br />') + '@||@' +
                          (items[i].item_discount       || '').toString().replace(/\n/g, '<br />') + '@||@' +
                          (items[i].item_tax_percentage || '').toString().replace(/\n/g, '<br />') +
                          '\r\n';
          }
          raw_data = raw_data.replace(data_key, data_value);
          break;

        case 'currency_code':
          raw_data = raw_data.replace('|currency|', data_value);
          break;

        case 'document_custom':
        case 'client_custom':
          data_value = '';
          var custom_data = invoice_data[key];
          for(i = 0; i < custom_data.length; i++)
          {
            data_value += (custom_data[i].name  || '').toString().replace(/\n/g, '<br />') + '@||@' +
                          (custom_data[i].value || '').toString().replace(/\n/g, '<br />') +
                          '\r\n';
          }
          raw_data = raw_data.replace(data_key, data_value);
          break;

        default:
          raw_data = raw_data.replace(data_key, data_value);
          break;
      }
      
    }

    raw_data = raw_data.replace(/\[crlf\]/g, '\r\n');

    return raw_data;
  };

  /**
   * Get URL query variable
   */
  var ib_getQueryVariable = function(variable, query_string)
  {
    var query = query_string || window.location.search.substring(1);
    var vars = query.split("&");

    for (var i=0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if(pair[0] == variable)
        return pair[1];
    }

    return false;
  };

  /*
   * ==================================================================================
   */
  ib_loadJavaScript(JQUERY);

  // Load the external data if specified in the query params
  var ib_query = ib_getScriptQueryVariables();

  var ib_data_file = ib_getQueryVariable('data', ib_query);

  if(ib_data_file)
  {
    var js = document.createElement('script');
    js.onerror = function() {
      js = document.createElement('script');
      js.src = 'data.js';
      document.body.appendChild(js);
    };

    js.src = 'data.txt';
    document.body.appendChild(js);
  }

  // Start polling...
  ib_checkJQuery(function($) {
    ib_initGenerator();
  });

})();
