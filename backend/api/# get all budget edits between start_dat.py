        # get all budget edits between start_date and end_date
        budget_edits = BudgetEdit.objects.filter(
            date__gte=start_date, date__lte=end_date)

        # create a dictionary of budget edits by date
        budget_edits_by_date = {}
        for budget_edit in budget_edits:
            if budget_edit.date not in budget_edits_by_date:
                budget_edits_by_date[budget_edit.date] = []
            budget_edits_by_date[budget_edit.date].append(budget_edit)

        # create dataframe with columns for date, categories, group_totals, row_total, and balance
        categories_data = []
        group_totals_data = []
        row_total_data = []
        balance_data = []
        for date in all_occurrences:
            categories = []
            group_totals = {}
            row_total = 0
            balance = 0

            # get all categories that occurred on this date
            for category in all_categories:
                if date in [date.date() for date in individual_occurrences[category.name]]:
                    categories.append(category)

            # apply budget edits to categories and group totals
            if date in budget_edits_by_date:
                for budget_edit in budget_edits_by_date[date]:
                    if budget_edit.category:
                        if budget_edit.category in categories:
                            if budget_edit.action == "remove":
                                categories.remove(budget_edit.category)
                            else:
                                budget_edit.category.adjusted_amount = budget_edit.amount
                        elif budget_edit.action == "add":
                            categories.append(budget_edit.category)
                            budget_edit.category.adjusted_amount = budget_edit.amount
                    elif budget_edit.group:
                        for category in category_dict[budget_edit.group]:
                            if date in [date.date() for date in individual_occurrences[category.name]]:
                                if budget_edit.action == "remove":
                                    categories.remove(category)
                                else:
                                    category.adjusted_amount = budget_edit.amount

            # calculate group totals and row total
            for category in categories:
                group_totals[category.group] = group_totals.get(
                    category.group, 0) + category.adjusted_amount
                row_total += category.adjusted_amount

            # calculate balance
            balance = row_total + balance_data[-1] if balance_data else row_total

            categories_data.append([category.name for category in categories])
            group_totals_data.append(group_totals)
            row_total_data.append(row_total)
            balance_data.append(balance)

        data = {
            "date": all_occurrences,
            "categories": categories_data,
            "group_totals": group_totals_data,
            "row_total": row_total_data,
            "balance": balance_data,
        }