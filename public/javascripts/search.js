(function() {
    var searchResults;
    var maxItems = 20;
    $.widget( "custom.catcomplete", $.ui.autocomplete, {
        _renderMenu: function( ul, items ) {
            //console.log(items);
            searchResults = items;
            var that = this,
                currentCategory = "";
            $.each( items, function( index, item ) {
                // Determining the count of methods matched for an endpoint here
                // is probably poor for performance. Worry about it later.
                var matchedMethodCount = 0;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].category === item.category) {
                        matchedMethodCount++;
                    }
                }
                if ( item.category != currentCategory ) {
                    var uiItem = $( "<li>" )
                        .addClass('ui-autocomplete-category')
                        .text(item.category + " | Methods matched: " + matchedMethodCount ) 
                        .click( function (event) {
                                $(this).nextUntil('.ui-autocomplete-category').slideToggle();
                        })
                        .hover(
                            // hoverOn
                            function () {
                                $(this).css('cursor', 'pointer');
                                $(this).css('text-decoration', 'underline');
                            },
                            // hoverOut
                            function () {
                                $(this).css('text-decoration', 'none');
                            }
                        );
                    ul.append(uiItem);
                    currentCategory = item.category;
                }
                that._renderItem( ul, item, items.length );
            });
        },
        _renderItem: function ( ul, item, count ) {
            var that = this;
            var link = "#"+(item.category + '-' + item.type + '-' + item.label).replace(/\s/g, '-');
            var testreturn = $( "<li>" )
                    .append( $( "<a href=" + link +">" ).text( item.label ))
                    .addClass(item.type.toLowerCase())
                    .click( function (event) {
                        if (/PUT|POST|GET|DELETE/.test(link)){
                            // Opens up a particular method.
                            var div_node = $('div.clickable').has('a[href="'+link+'"]');
                            if (div_node.closest('li.endpoint').hasClass('expanded')) {
                                // do nothing
                            }
                            else {
                                div_node.closest('li.endpoint').toggleClass('expanded');
                                div_node.closest('li.endpoint').children('ul.methods').slideToggle();
                            }
                            div_node.siblings('form').slideToggle();
                        }
                        // Close the search results box after a method has been clicked on.
                        that.close(event);
                        event.preventDefault();
                    })
                    .appendTo( ul );
            if (count > maxItems) {
                  return testreturn.css('display', 'none');
            }
            else {
                  return testreturn;
            }
        }
    });

    $( "#search1" ).catcomplete({
        source: "search",
        minLength: 2,
    });


    $('#searchForm').submit( function()  {
        clearSearch();
        if ( $('#search1').val().length > 0 ) {
            $("#search1").catcomplete("close");
            $('li.endpoint > h3.title span.name').each(function () {
                if(!matching($(this).text(), searchResults)) {
                    $(this).parent().parent().addClass('hide-this');
                }
                else {
                    // endpoint name matched
                    //console.log($(this).text());

                    // Deal with hiding methods that did not match. 
                    $(this.parentNode).siblings('ul.methods').children('li.method').each(function () {
                        if (!matching($(this).find('div.title span.name').text(), searchResults)) {
                            //console.log($(this).find('div.title span.name').text());
                            $(this).addClass('hide-this');
                        }
                        else {
                            //console.log($(this).find('div.title span.name').text());
                        }
                    });

                    // Toggle endpoint
                    $('ul.methods', this.parentNode.parentNode).slideToggle();
                    $(this.parentNode.parentNode).toggleClass('expanded');
                }
            });
        }
        return false;

    });

    $('#clear-search').click(function () {
        clearSearch();
    });

    function matching (text, searchResults) {
        for (var k = 0; k < searchResults.length; k++) {
            for ( var prop in searchResults[k] ) {
                if (searchResults[k][prop] == text) {
                    // Match found
                    return true;
                }
            }
        }
        // No matches found.
        return false;
    }

    function clearSearch () {
        $('li.method.hide-this').removeClass('hide-this');
        // Close open endpoints
        var endpoints = $('ul.methods'),
            endpointsLength = endpoints.length;

        for (var x = 0; x < endpointsLength; x++) {
            var methodsList = $(endpoints[x]);
            methodsList.slideUp();
            methodsList.parent().toggleClass('expanded', false)
        }
        $('li.endpoint.hide-this').removeClass('hide-this');
    }

})();


